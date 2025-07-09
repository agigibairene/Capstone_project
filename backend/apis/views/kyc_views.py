import logging
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated,  IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import  get_user_model
from django.contrib.auth.models import User
from django.utils import timezone  
from django.db import transaction
from ..serializers import (
    KYCPreFillSerializer,  InvestorKYCSerializer, FarmerKYCSerializer, 
    KYCVerificationLogSerializer, KYCStatusSerializer, KYCAdminUpdateSerializer,
)
from ..models import InvestorKYC, FarmerKYC, KYCVerificationLog
import traceback
from rest_framework import status


logger = logging.getLogger(__name__)

User = get_user_model()

# VIEWS TO GET TO KNOW YOUR CUSTOMER KYC

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_investor_kyc(request):
    """Submit investor KYC information"""
    try:
        existing_kyc = InvestorKYC.objects.filter(user=request.user).first()
        if existing_kyc:
            return Response({
                'success': False,
                'message': 'KYC already submitted. Use update endpoint to modify.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not hasattr(request.user, 'profile') or request.user.profile.role != 'Investor':
            return Response({
                'success': False,
                'message': 'Only investors can submit investor KYC'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = InvestorKYCSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            kyc = serializer.save()
            return Response({
                'success': True,
                'message': 'Investor KYC submitted successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error submitting KYC: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_farmer_kyc(request):
    """Submit farmer/project seeker KYC information"""
    try:
        user = request.user
        
        existing_kyc = FarmerKYC.objects.filter(user=user).first()
        if existing_kyc:
            return Response({
                'success': False,
                'message': 'KYC already submitted. Contact support if changes are needed.',
                'data': {
                    'kyc_id': existing_kyc.id,
                    'submitted_date': existing_kyc.created_at,
                    'is_verified': existing_kyc.is_verified
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not hasattr(user, 'profile'):
            return Response({
                'success': False,
                'message': 'User profile not found. Please complete your profile first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        allowed_roles = ['Farmer', 'Student', 'Entrepreneur']
        if user.profile.role not in allowed_roles:
            return Response({
                'success': False,
                'message': f'Only users with roles {", ".join(allowed_roles)} can submit farmer KYC. Your current role: {user.profile.role}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        required_fields = [
            'full_name', 'email', 'phone_number', 'role', 'date_of_birth', 
            'nationality', 'background', 'address', 'id_type', 'id_number', 
            'id_document', 'profile_picture'
        ]
        
        missing_fields = []
        for field in required_fields:
            if field not in request.data or not request.data.get(field):
                missing_fields.append(field)
        
        if missing_fields:
            return Response({
                'success': False,
                'message': 'Missing required fields',
                'errors': {
                    'missing_fields': missing_fields,
                    'required': 'All fields are required for KYC submission'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = FarmerKYCSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            with transaction.atomic():
                try:
                    kyc = serializer.save()
                    
                    logger.info(f"Farmer KYC submitted successfully for user {user.email} (ID: {user.id})")
                    
                    return Response({
                        'success': True,
                        'message': 'Farmer KYC submitted successfully. Your submission is under review.',
                        'data': {
                            'kyc_id': kyc.id,
                            'submitted_date': kyc.created_at,
                            'status': 'pending_verification',
                            'next_steps': 'Your KYC will be reviewed by our team. You will be notified once verification is complete.'
                        }
                    }, status=status.HTTP_201_CREATED)
                    
                except Exception as save_error:
                    logger.error(f"Error saving farmer KYC for user {user.email}: {str(save_error)}")
                    return Response({
                        'success': False,
                        'message': 'Failed to save KYC data. Please try again.',
                        'errors': {'save_error': str(save_error)}
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        logger.warning(f"Farmer KYC validation failed for user {user.email}: {serializer.errors}")
        
        formatted_errors = {}
        for field, errors in serializer.errors.items():
            if isinstance(errors, list):
                formatted_errors[field] = errors[0] if errors else "Invalid value"
            else:
                formatted_errors[field] = str(errors)
        
        return Response({
            'success': False,
            'message': 'Please correct the following errors and try again.',
            'errors': formatted_errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Unexpected error in submit_farmer_kyc for user {request.user.email if request.user.is_authenticated else 'anonymous'}: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        
        return Response({
            'success': False,
            'message': 'An unexpected error occurred while processing your KYC submission. Please try again later.',
            'errors': {'general': 'Internal server error'}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_kyc_status(request):
    """Get user's KYC status"""
    try:
        user = request.user
        
        # Check if user has profile
        if not hasattr(user, 'profile'):
            return Response({
                'success': False,
                'message': 'User profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        user_role = user.profile.role
        
        if user_role == 'Investor':
            kyc = InvestorKYC.objects.filter(user=user).first()
        elif user_role == 'Farmer':
            kyc = FarmerKYC.objects.filter(user=user).first()
        else:
            return Response({
                'success': False,
                'message': 'Invalid user role'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if kyc:
            status_data = {
                'has_kyc': True,
                'kyc_type': user_role.lower(),
                'is_verified': kyc.is_verified,
                'verification_date': kyc.verification_date,
                'submitted_date': kyc.created_at
            }
        else:
            status_data = {
                'has_kyc': False,
                'kyc_type': None,
                'is_verified': False,
                'verification_date': None,
                'submitted_date': None
            }
        
        serializer = KYCStatusSerializer(status_data)
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error getting KYC status: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_kyc(request):
    """Get user's KYC details"""
    try:
        user = request.user
        
        if not hasattr(user, 'profile'):
            return Response({
                'success': False,
                'message': 'User profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        user_role = user.profile.role
        
        if user_role == 'Investor':
            kyc = get_object_or_404(InvestorKYC, user=user)
            serializer = InvestorKYCSerializer(kyc)
        elif user_role == 'Farmer':
            kyc = get_object_or_404(FarmerKYC, user=user)
            serializer = FarmerKYCSerializer(kyc)
        else:
            return Response({
                'success': False,
                'message': 'Invalid user role'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error getting KYC: {str(e)}'
        }, status=status.HTTP_404_NOT_FOUND if 'not found' in str(e).lower() else status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_kyc_logs(request):
    """Get user's KYC verification logs"""
    try:
        logs = KYCVerificationLog.objects.filter(user=request.user)
        serializer = KYCVerificationLogSerializer(logs, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error getting KYC logs: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_list_pending_kyc(request):
    """Admin: List all pending KYC submissions"""
    try:
        kyc_type = request.GET.get('type', 'all')  
        
        data = []
        
        if kyc_type in ['investor', 'all']:
            investor_kycs = InvestorKYC.objects.filter(is_verified=False)
            for kyc in investor_kycs:
                serializer = InvestorKYCSerializer(kyc)
                kyc_data = serializer.data
                kyc_data['user_info'] = {
                    'id': kyc.user.id,
                    'username': kyc.user.username,
                    'email': kyc.user.email
                }
                kyc_data['kyc_type'] = 'investor'
                data.append(kyc_data)
        
        if kyc_type in ['farmer', 'all']:
            farmer_kycs = FarmerKYC.objects.filter(is_verified=False)
            for kyc in farmer_kycs:
                serializer = FarmerKYCSerializer(kyc)
                kyc_data = serializer.data
                kyc_data['user_info'] = {
                    'id': kyc.user.id,
                    'username': kyc.user.username,
                    'email': kyc.user.email
                }
                kyc_data['kyc_type'] = 'farmer'
                data.append(kyc_data)
        
        return Response({
            'success': True,
            'data': data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error listing KYC submissions: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_verify_kyc(request, user_id):
    """Admin: Verify/reject user's KYC with optional change allowance"""
    try:
        user = get_object_or_404(User, id=user_id)
        
        if not hasattr(user, 'profile'):
            return Response({
                'success': False,
                'message': 'User profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = KYCAdminUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        action = serializer.validated_data['action']
        allow_changes = serializer.validated_data.get('allow_changes', False)
        
        user_role = user.profile.role
        
        if user_role == 'Investor':
            kyc = get_object_or_404(InvestorKYC, user=user)
        elif user_role == 'Farmer':
            kyc = get_object_or_404(FarmerKYC, user=user)
        else:
            return Response({
                'success': False,
                'message': 'Invalid user role'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if action == 'approved':
            kyc.is_verified = True
            kyc.verification_date = timezone.now()
            kyc.changes_allowed = allow_changes
        elif action == 'rejected':
            kyc.is_verified = False
            kyc.verification_date = None
            kyc.changes_allowed = False
        else:
            kyc.is_verified = False
            kyc.verification_date = None
            kyc.changes_allowed = False
        
        kyc.save()
        
        KYCVerificationLog.objects.create(
            user=user,
            action=action,
            admin_user=request.user
        )
        
        return Response({
            'success': True,
            'message': f'KYC {action} successfully',
            'data': {
                'user_id': user.id,
                'action': action,
                'is_verified': kyc.is_verified,
                'verification_date': kyc.verification_date,
                'changes_allowed': kyc.changes_allowed
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error verifying KYC: {str(e)}'
        }, status=status.HTTP_404_NOT_FOUND if 'not found' in str(e).lower() else status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_kyc_change(request):
    """Allow users to request KYC changes through admin"""
    try:
        user = request.user
        reason = request.data.get('reason', '')
        requested_changes = request.data.get('requested_changes', '')
        
        if not reason or not requested_changes:
            return Response({
                'success': False,
                'message': 'Both reason and requested_changes are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        KYCVerificationLog.objects.create(
            user=user,
            action='change_requested',
        )
        
        return Response({
            'success': True,
            'message': 'Change request submitted successfully. An admin will review your request.'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error submitting change request: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_kyc(request):
    user = request.user
    
    try:
        response_data = {
            'success': True,
            'role': getattr(user, 'profile', None) and user.profile.role or None,
            'kyc': None
        }

        # Check KYC records
        if hasattr(user, 'investor_kyc'):
            serializer = InvestorKYCSerializer(user.investor_kyc)
            response_data['kyc'] = serializer.data
        elif hasattr(user, 'farmer_kyc'):
            serializer = FarmerKYCSerializer(user.farmer_kyc)
            response_data['kyc'] = serializer.data

        return Response(response_data)

    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=500)
        
       
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kyc_autofill_data(request):
    user = request.user
    profile = getattr(user, 'profile', None)

    data = {
        "full_name": f"{user.first_name} {user.last_name}".strip(),
        "email": user.email,
        "phone_number": profile.phone_number if profile else "",
        "role": profile.role if profile else "",
    }

    serializer = KYCPreFillSerializer(data)
    return Response(serializer.data)

        