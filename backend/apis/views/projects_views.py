import os
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from ..permissions import CanViewProject, IsVerifiedFarmer
from ..models import  InvestorKYC, Project
from ..serializers import  ProjectCreateSerializer, ProjectSerializer
from django.views.decorators.clickjacking import xframe_options_exempt
from django.http import FileResponse, Http404
from django.db.models import Sum, Count
from datetime import timedelta
from django.utils import timezone


# PROJECT VIEWS 

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
