from django.core.mail import EmailMessage
import os
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from ..permissions import CanViewProject, IsVerifiedFarmer
from ..models import  InvestorKYC, NDAAgreement, Project, UserProfile
from ..serializers import  NDAAgreementSerializer, ProjectCreateSerializer, ProjectSerializer
from django.views.decorators.clickjacking import xframe_options_exempt
from django.http import FileResponse, Http404
from django.db.models import Sum, Count
from datetime import timedelta
from django.utils import timezone
import logging


logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsVerifiedFarmer])
def create_project(request):
    """
    Create a new project (only for verified farmers)
    """
    try:
        serializer = ProjectCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            project = serializer.save(farmer=request.user)

            try:
                # Optionally get user profile and role
                profile = getattr(request.user, 'profile', None)

                subject = "📢 New Project Created by Farmer"
                msg = (
                    f"A new project has been created:\n\n"
                    f"Farmer Name: {request.user.first_name} {request.user.last_name}\n"
                    f"Email: {request.user.email}\n"
                    f"Project Title: {project.title}\n"
                    f"Phone: {profile.phone_number}\n"
                    f"Project ID: {project.id}\n"
                )

                email = EmailMessage(
                    subject,
                    msg,
                    settings.EMAIL_HOST_USER,
                    [settings.EMAIL_HOST_USER],  
                )
                email.send(fail_silently=False)

            except Exception as email_error:
                logger.warning(f"Failed to send admin notification: {str(email_error)}")

            return Response({
                'success': True,
                'message': 'Project created successfully',
                'data': ProjectSerializer(project, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)

        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.exception("Error in create_project")
        return Response({
            'success': False,
            'message': f'Error creating project: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated, CanViewProject])
def list_projects(request):
    """List all approved projects (viewable by all authenticated users)"""
    projects = Project.objects.filter(status='approved').order_by('-created_at')
    serializer = ProjectSerializer(projects, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, CanViewProject])
def project_detail(request, project_id):
    """
    Get details of a specific project
    """
    project = get_object_or_404(Project, id=project_id)
    serializer = ProjectSerializer(project, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsVerifiedFarmer])
def farmer_projects(request):
    """
    List all projects for the authenticated farmer
    """
    if not hasattr(request.user, 'profile') or request.user.profile.role != 'Farmer':
        return Response({'error': 'User is not a farmer'}, 
            status=status.HTTP_403_FORBIDDEN)
    
    projects = Project.objects.filter(farmer=request.user).order_by('-created_at')
    serializer = ProjectSerializer(projects, many=True, context={'request': request})
    return Response(serializer.data)


@xframe_options_exempt
def serve_watermarked_proposal(request, filename):
    full_path = os.path.join(settings.MEDIA_ROOT, 'proposals', 'watermarked', filename)

    if not os.path.exists(full_path):
        raise Http404("Watermarked proposal not found.")

    return FileResponse(open(full_path, 'rb'), content_type='application/pdf')

@api_view(['GET'])
@permission_classes([IsAuthenticated, CanViewProject])
def search_projects(request):
    """
    Search projects with multiple filters
    """
    projects = Project.objects.filter(status='approved')
    
    # Multiple filter options
    farmer_id = request.query_params.get('farmer_id')
    project_type = request.query_params.get('type')
    location = request.query_params.get('location')
    
    if farmer_id:
        projects = projects.filter(farmer_id=farmer_id)
    if project_type:
        projects = projects.filter(project_type=project_type)
    if location:
        projects = projects.filter(location__icontains=location)
    
    projects = projects.order_by('-created_at')
    serializer = ProjectSerializer(projects, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsVerifiedFarmer])
def farmer_projects_sum(request):
    """
    Get the total sum of target amounts for all projects belonging to the authenticated farmer,
    excluding rejected projects.
    """
    if not hasattr(request.user, 'profile') or request.user.profile.role != 'Farmer':
        return Response(
            {'success': False, 'error': 'User is not a farmer'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Calculate the total sum, excluding rejected projects
        result = Project.objects.filter(
            farmer=request.user
        ).exclude(
            status='rejected'
        ).aggregate(
            total_sum=Sum('target_amount'),
            project_count=Count('id')
        )
        
        return Response({
            'success': True,
            'total_amount_needed': result['total_sum'] or 0,
            'project_count': result['project_count'] or 0,
            'currency': 'USD'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


@api_view(['GET'])
@permission_classes([IsAuthenticated, CanViewProject])
def get_recommended_projects(request):
    user = request.user
    today = timezone.now().date()
    deadline_cutoff = today + timedelta(days=5)

    try:
        kyc = InvestorKYC.objects.get(user=user, is_verified=True)
        annual_income = kyc.annual_income
    except InvestorKYC.DoesNotExist:
        return Response({
            "success": False,
            "message": "Investor KYC not found or not verified."
        }, status=status.HTTP_403_FORBIDDEN)

    # Separate filters
    projects_due_soon = Project.objects.filter(
        status='approved',
        deadline__range=[today, deadline_cutoff]
    ).order_by('deadline')

    projects_within_budget = Project.objects.filter(
        status='approved',
        target_amount__lte=annual_income
    ).order_by('deadline')

    # Serialize separately
    due_soon_serialized = ProjectSerializer(projects_due_soon, many=True, context={'request': request})
    within_budget_serialized = ProjectSerializer(projects_within_budget, many=True, context={'request': request})

    return Response({
        "success": True,
        "message": "Projects fetched successfully.",
        "projects_due_soon": due_soon_serialized.data,
        "projects_within_budget": within_budget_serialized.data
    }, status=status.HTTP_200_OK)


# NDA VIEW

from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.units import inch
from io import BytesIO
import os

@api_view(['POST'])
@permission_classes([IsAuthenticated]) 
def submit_nda(request):
    try:
        user_profile = request.user.profile
    except UserProfile.DoesNotExist:
        return Response({'error': 'User profile not found'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if the user is an Investor
    if user_profile.role != 'Investor':
        return Response({'error': 'Only users with the Investor role can submit the NDA'}, status=status.HTTP_403_FORBIDDEN)

    # Check if user already has an NDA
    if NDAAgreement.objects.filter(user=request.user).exists():
        return Response({'error': 'You have already submitted an NDA agreement'}, status=status.HTTP_400_BAD_REQUEST)

    data = request.data.copy()
    data['ip_address'] = get_client_ip(request)
    data['user'] = request.user.id

    serializer = NDAAgreementSerializer(data=data)
    if serializer.is_valid():
        nda = serializer.save()
        return Response({
            'message': 'NDA successfully submitted',
            'nda_id': nda.id
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_nda_status(request):
    """Check if user has already submitted NDA"""
    try:
        user_profile = request.user.profile
        if user_profile.role != 'Investor':
            return Response({'has_nda': False}, status=status.HTTP_200_OK)
        
        nda = NDAAgreement.objects.filter(user=request.user).first()
        if nda:
            return Response({
                'has_nda': True,
                'nda_data': {
                    'full_name': nda.full_name,
                    'email': nda.email,
                    'company': nda.company,
                    'date_signed': nda.date_signed,
                    'submitted_at': nda.submitted_at
                }
            }, status=status.HTTP_200_OK)
        
        return Response({'has_nda': False}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.units import inch
import urllib.request

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_nda(request):
    try:
        user_profile = request.user.profile
        if user_profile.role != 'Investor':
            return Response({'error': 'Only investors can download NDA'}, status=status.HTTP_403_FORBIDDEN)

        nda = NDAAgreement.objects.filter(user=request.user).first()
        if not nda:
            return Response({'error': 'No NDA found for this user'}, status=status.HTTP_404_NOT_FOUND)

        # Generate PDF
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="NDA_{nda.full_name}_{nda.date_signed}.pdf"'

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)

        # Define styles
        base_styles = getSampleStyleSheet()
        normal_style = ParagraphStyle(
            name='CustomNormal',
            parent=base_styles['Normal'],
            fontSize=12,
            leading=15
        )
        title_style = ParagraphStyle(
            name='CustomTitle',
            parent=base_styles['Title'],
            fontSize=20,
            leading=24,
            alignment=1 
        )

        story = []

        # Title
        story.append(Paragraph("NON-DISCLOSURE AGREEMENT", title_style))
        story.append(Spacer(1, 12))

        nda_content = f"""
            <b>1. Purpose</b><br/>
            The purpose of this Agreement is to prevent unauthorized use, disclosure, or reproduction of confidential information and intellectual property belonging to project owners (Farmers or Agricultural Entrepreneurs) listed on the Platform.<br/><br/>

            <b>2. Definitions</b><br/>
            <b>2.1 Confidential Information</b><br/>
            Includes all business proposals, documentation, business plans, financial projections, technological concepts, sustainable methods, or any materials uploaded by project owners, whether marked as confidential or not.<br/><br/>
            <b>2.2 Intellectual Property (IP)</b><br/>
            Includes all trademarks, copyrights, trade secrets, processes, techniques, ideas, inventions, and other proprietary content disclosed through proposal documents or listed projects.<br/><br/>

            <b>3. Obligations of Recipient</b><br/>
            3.1 Recipient agrees not to copy, reproduce, disclose, reverse-engineer, exploit, or use any part of the Confidential Information or IP for personal or commercial gain without express written consent of the rightful owner.<br/>
            3.2 Recipient shall not implement, replicate, or attempt to profit from any idea, concept, or structure disclosed through the Platform's proposals.<br/>
            3.3 Recipient agrees not to share, distribute, or disclose any content to third parties, including colleagues, partners, or competing platforms.<br/>
            3.4 Recipient agrees to use all reasonable means to protect and maintain the confidentiality and integrity of such information.<br/><br/>

            <b>4. Access Limitations</b><br/>
            4.1 Only investors who have signed this NDA via digital e-signature may view watermarked PDF proposals on a read-only basis through the Platform.<br/>
            4.2 Farmers are restricted from accessing or viewing other users' proposals or project documents.<br/><br/>

            <b>5. Ownership & IPR</b><br/>
            5.1 All Confidential Information and associated Intellectual Property remains the sole property of the original project owner.<br/>
            5.2 This Agreement does not transfer any ownership rights to the Recipient, nor does it grant any license or rights beyond those expressly stated.<br/><br/>

            <b>6. Watermarking & Content Protection</b><br/>
            6.1 All uploaded proposals are automatically embedded with "Agriconnect" watermarks using PyPDF2 and displayed in a secure PDF format.<br/>
            6.2 This protection is enforced to prevent unauthorized reproduction or sharing of materials.<br/><br/>

            <b>7. Legal Enforcement</b><br/>
            7.1 Any breach of this Agreement, including misuse, unauthorized implementation, or disclosure of confidential material, will result in immediate legal action.<br/>
            7.2 The Platform reserves the right to suspend, terminate, or permanently ban users in breach of this Agreement and seek damages, injunctive relief, and/or prosecution.<br/><br/>

            <b>8. E-Signature & Acceptance</b><br/>
            By signing electronically, the Recipient acknowledges that:<br/>
            • They have read and understood this Agreement<br/>
            • They agree to be legally bound by its terms<br/>
            • They accept that a violation may result in legal liability.<br/><br/>

            <b>9. Governing Law</b><br/>
            This Agreement shall be governed by and construed in accordance with the laws of the Republic of Ghana, according to the Copyright Act, 2005 (Act 690), the Patents Act, 2003 (Act 657), the Trademarks Act, 2004 (Act 664), the Industrial Designs Act, 2003 (Act 660), and the Protection Against Unfair Competition Act, 2000 (Act 589), without applying any rules that might direct the use of another jurisdiction's laws.<br/><br/>
        """

        content = f"""
        This Non-Disclosure Agreement is entered into on {nda.date_signed} by and between 
        <b>Agriconnect</b>, an agricultural non-governmental platform, and the undersigned 
        individual <b>{nda.full_name}</b>.
        
        {nda_content}
        
        <br/><br/>
        
        <b>Signatory Information:</b><br/>
        Full Name: {nda.full_name}<br/>
        Email: {nda.email}<br/>
        Company: {nda.company or 'N/A'}<br/>
        Date Signed: {nda.date_signed}<br/>
        IP Address: {nda.ip_address}<br/>
        Submitted At: {nda.submitted_at.strftime('%Y-%m-%d %H:%M:%S')}<br/>
        
        <br/><br/>
        
        <b>Electronic Signature:</b><br/>
        This document has been electronically signed by {nda.full_name} on {nda.date_signed}.
        """

        story.append(Paragraph(content, normal_style))

        # Add the signature if available from S3 URL
        if nda.signature and nda.signature.url:
            try:
                story.append(Spacer(1, 12))
                story.append(Paragraph("<b>Digital Signature:</b>", normal_style))

                # Load the image from the S3 URL
                with urllib.request.urlopen(nda.signature.url) as url_response:
                    img_data = url_response.read()
                    img_stream = BytesIO(img_data)
                    signature_img = Image(img_stream, width=3*inch, height=1*inch)
                    story.append(signature_img)
            except Exception as e:
                story.append(Paragraph(f"Signature image not available: {str(e)}", normal_style))

        doc.build(story)
        pdf = buffer.getvalue()
        buffer.close()
        response.write(pdf)

        return response

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR')

