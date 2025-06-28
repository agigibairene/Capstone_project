from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.mail import EmailMessage
from django.conf import settings
from django.urls import reverse
from .models import PasswordReset, UserProfile
from .serializers import (
    UserProfileSerializer, UserSignUpSerializer, UserLoginSerializer,
    PasswordResetRequestSerializer, PasswordResetSerializer, UserSerializer,
    UserUpdateSerializer,  InvestorKYCSerializer, FarmerKYCSerializer, 
    KYCVerificationLogSerializer, KYCStatusSerializer, KYCAdminUpdateSerializer
)
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import HttpResponseRedirect
from .models import InvestorKYC, FarmerKYC, KYCVerificationLog




@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    """User registration endpoint"""
    serializer = UserSignUpSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate JWT tokens for the new user
        refresh = RefreshToken.for_user(user)
        
        # Ensure user profile exists (create if missing)
        try:
            profile = user.profile
            if not profile:
                raise UserProfile.DoesNotExist
        except UserProfile.DoesNotExist:
            UserProfile.objects.create(
                user=user,
                phone_number='',
                role='Farmer',  # Default role, should be set properly from signup data
                organization='',
                investor_type=''
            )
            print(f"Created missing profile for user {user.email}")
        
        # Serialize user data
        user_data = UserSerializer(user).data
        
        return Response({
            'success': True, 
            'message': 'Account created successfully',
            'user': user_data,
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False, 
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = authenticate(
            request,
            username=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        if user:
            login(request, user)
            refresh = RefreshToken.for_user(user)

            try:
                profile = user.profile
                if not profile:
                    raise UserProfile.DoesNotExist
            except UserProfile.DoesNotExist:
                UserProfile.objects.create(
                    user=user,
                    phone_number='',
                    role='Farmer',  
                    organization='',
                    investor_type=''
                )
                print(f"Created missing profile for user {user.email}")

            user_data = UserSerializer(user).data
            print(f"Login successful for user: {user.email}")
            print(f"User data being returned: {user_data}")

            return Response({
                'success': True,
                'message': 'Login successful',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': user_data
            })
        return Response({
            'success': False,
            'errors': {'general': 'Invalid credentials'}
        }, status=401)
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=400)
    
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """User logout endpoint"""
    logout(request)
    return Response({
        'success': True, 
        'message': 'Logged out successfully'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_view(request):
    """Password reset request endpoint"""
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = User.objects.get(email=serializer.validated_data['email'])
            
            PasswordReset.objects.filter(user=user).delete()
            
            reset_instance = PasswordReset.objects.create(user=user)
            reset_link = f"{request.scheme}://{request.get_host()}{reverse('reset-password', args=[reset_instance.reset_id])}"

            email_message = EmailMessage(
                'Reset your password',
                f'Reset your password using the link below:\n\n{reset_link}\n\nThis link will expire in 10 minutes.',
                settings.EMAIL_HOST_USER,
                [user.email]
            )
            email_message.send(fail_silently=True)

            return Response({
                'success': True, 
                'message': 'Password reset email sent'
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'success': False, 
                'errors': {'email': 'Email not found'}
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False, 
                'errors': {'general': 'Failed to send email'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response({
        'success': False, 
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def reset_password_view(request, reset_id):
    if request.method == 'GET':
        frontend_url = f"http://localhost:8080/reset/{reset_id}"
        return HttpResponseRedirect(frontend_url)

    serializer = PasswordResetSerializer(data=request.data)
    if serializer.is_valid():
        try:
            reset_instance = PasswordReset.objects.get(reset_id=reset_id)
            expiration_time = reset_instance.created_when + timezone.timedelta(minutes=10)
            if timezone.now() > expiration_time:
                reset_instance.delete()
                return Response({
                    'success': False, 
                    'errors': {'general': 'Reset link has expired'}
                }, status=status.HTTP_400_BAD_REQUEST)

            user = reset_instance.user
            user.set_password(serializer.validated_data['password'])
            user.save()
            reset_instance.delete()
            return Response({
                'success': True, 
                'message': 'Password reset successful'
            }, status=status.HTTP_200_OK)
        except PasswordReset.DoesNotExist:
            return Response({
                'success': False, 
                'errors': {'general': 'Invalid reset ID'}
            }, status=status.HTTP_404_NOT_FOUND)
    return Response({
        'success': False, 
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    """Get current user's profile"""
    try:
        profile = request.user.profile
        serializer = UserProfileSerializer(profile)
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    except UserProfile.DoesNotExist:
        return Response({
            'success': False,
            'errors': {'general': 'User profile not found'}
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_detail_view(request):
    """Get complete user information including profile"""
    serializer = UserSerializer(request.user)
    return Response({
        'success': True,
        'data': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_user_view(request):
    """Update user information"""
    serializer = UserUpdateSerializer(
        request.user, 
        data=request.data, 
        partial=request.method == 'PATCH'
    )
    if serializer.is_valid():
        user = serializer.save()
        response_serializer = UserSerializer(user)
        return Response({
            'success': True,
            'message': 'User updated successfully',
            'data': response_serializer.data
        }, status=status.HTTP_200_OK)
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    """Update user profile only"""
    try:
        profile = request.user.profile
        serializer = UserProfileSerializer(
            profile, 
            data=request.data, 
            partial=request.method == 'PATCH'
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Profile updated successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except UserProfile.DoesNotExist:
        return Response({
            'success': False,
            'errors': {'general': 'User profile not found'}
        }, status=status.HTTP_404_NOT_FOUND)

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
        # Check if user already has KYC
        existing_kyc = FarmerKYC.objects.filter(user=request.user).first()
        if existing_kyc:
            return Response({
                'success': False,
                'message': 'KYC already submitted. Use update endpoint to modify.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user role is farmer
        if not hasattr(request.user, 'profile') or request.user.profile.role != 'Farmer':
            return Response({
                'success': False,
                'message': 'Only farmers can submit farmer KYC'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = FarmerKYCSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            kyc = serializer.save()
            return Response({
                'success': True,
                'message': 'Farmer KYC submitted successfully',
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
        kyc_type = request.GET.get('type', 'all')  # 'investor', 'farmer', or 'all'
        
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
        notes = serializer.validated_data.get('notes', '')
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
        elif action == 'rejected':
            kyc.is_verified = False
            kyc.verification_date = None
        else:  
            kyc.is_verified = False
            kyc.verification_date = None
        
        kyc.notes = notes
        kyc.save()
        
        log_notes = notes
        if allow_changes:
            log_notes += " [ADMIN ALLOWED ONE-TIME CHANGES]"
            
        KYCVerificationLog.objects.create(
            user=user,
            action=action,
            notes=log_notes,
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
                'changes_allowed': allow_changes
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
            notes=f"Change request - Reason: {reason}. Requested changes: {requested_changes}"
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

