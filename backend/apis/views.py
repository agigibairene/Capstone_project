from datetime import timedelta
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate,logout, get_user_model
from django.contrib.auth.models import User
from django.utils import timezone  
from django.core.mail import EmailMessage
from django.conf import settings
from django.urls import reverse
from django.db import transaction
from .models import OTPToken, PasswordReset, UserProfile
from .serializers import (
    UserProfileSerializer, UserSignUpSerializer, UserLoginSerializer,
    PasswordResetRequestSerializer, PasswordResetSerializer, UserSerializer,
    UserUpdateSerializer, InvestorKYCSerializer, FarmerKYCSerializer, 
    KYCVerificationLogSerializer, KYCStatusSerializer, KYCAdminUpdateSerializer
)
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import HttpResponseRedirect
from .models import InvestorKYC, FarmerKYC, KYCVerificationLog
import logging
import traceback

# Set up logging
logger = logging.getLogger(__name__)

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    """User registration endpoint"""
    serializer = UserSignUpSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
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
    """Login endpoint that sends OTP after successful authentication"""
    try:
        logger.info(f"Login attempt for data: {request.data}")
        
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                request,
                username=serializer.validated_data['email'],
                password=serializer.validated_data['password']
            )
            
            if user:
                logger.info(f"User authenticated: {user.email}")
                
                try:
                    with transaction.atomic():
                        # Delete any existing OTPs for this user
                        deleted_count = OTPToken.objects.filter(user=user).count()
                        OTPToken.objects.filter(user=user).delete()
                        logger.info(f"Deleted {deleted_count} existing OTPs for user {user.email}")
                        
                        # Create new OTP
                        otp = OTPToken.objects.create(
                            user=user,
                            otp_expires_at=timezone.now() + timedelta(minutes=5)
                        )
                        logger.info(f"Created OTP {otp.otp_code} for user {user.email}")
                        
                        # Send OTP email
                        message = f"""
                            Hello,

                            Your One-Time Password (OTP) is: {otp.otp_code}

                            This code will expire in 5 minutes. Please enter it to proceed with your login.

                            Thank you,
                            Agriconnect
                            """

                        
                        if not hasattr(settings, 'EMAIL_HOST_USER') or not settings.EMAIL_HOST_USER:
                            logger.warning("EMAIL_HOST_USER not configured, skipping email send")
                            logger.info(f"DEV MODE - OTP for {user.email}: {otp.otp_code}")
                        else:
                            email_message = EmailMessage(
                                "Login Verification - OTP",
                                message,
                                settings.EMAIL_HOST_USER,
                                [user.email]
                            )
                            email_message.send(fail_silently=False)
                            logger.info(f"OTP email sent to {user.email}")
                        
                        return Response({
                            'success': True,
                            'message': 'OTP sent to your email. Please verify to complete login.',
                            'requires_otp': True,
                            'username': user.username
                        }, status=status.HTTP_200_OK)
                        
                except Exception as e:
                    logger.error(f"OTP creation/sending error: {str(e)}")
                    logger.error(f"Traceback: {traceback.format_exc()}")
                    return Response({
                        'success': False,
                        'errors': {'general': 'Failed to send OTP. Please try again.'}
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            logger.warning(f"Authentication failed for email: {serializer.validated_data['email']}")
            return Response({
                'success': False,
                'errors': {'general': 'Invalid credentials'}
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        logger.warning(f"Login serializer validation failed: {serializer.errors}")
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Login view error: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return Response({
            'success': False,
            'errors': {'general': 'An error occurred during login. Please try again.'}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_login_otp(request):
    """Verify OTP and complete login process"""
    try:
        username = request.data.get('username')
        otp_code = request.data.get('otp_code')
        
        logger.info(f"OTP verification attempt for username: {username}")
        
        if not username or not otp_code:
            return Response({
                'success': False, 
                'errors': {'general': 'Username and OTP code are required'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(username=username)
            logger.info(f"Found user: {user.email}")
            
            try:
                otp_token = OTPToken.objects.filter(
                    user=user
                ).order_by('-otp_created_at').first()
                
                if not otp_token:
                    logger.warning(f"No OTP found for user: {user.email}")
                    return Response({
                        'success': False,
                        'errors': {'general': 'No OTP found. Please request a new one.'}
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                if otp_token.is_expired():
                    logger.warning(f"Expired OTP for user: {user.email}")
                    otp_token.delete()
                    return Response({
                        'success': False,
                        'errors': {'general': 'OTP has expired. Please request a new one.'}
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                if otp_token.otp_code != otp_code:
                    logger.warning(f"Invalid OTP for user: {user.email}. Expected: {otp_token.otp_code}, Got: {otp_code}")
                    return Response({
                        'success': False,
                        'errors': {'general': 'Invalid OTP code. Please try again.'}
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                logger.info(f"Valid OTP for user: {user.email}")
                
                with transaction.atomic():
                    otp_token.delete()
                    
                    if not user.is_active:
                        user.is_active = True
                        user.save(update_fields=['is_active'])
                    
                    refresh = RefreshToken.for_user(user)
                    access_token = refresh.access_token
                    
                    try:
                        profile = user.profile
                    except UserProfile.DoesNotExist:
                        profile = UserProfile.objects.create(
                            user=user,
                            phone_number='',
                            role='Farmer',
                            organization='',
                            investor_type=''
                        )
                        logger.info(f"Created missing profile for user: {user.email}")
                    
                    user_data = {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'is_active': user.is_active,
                        'profile': {
                            'id': profile.id,
                            'phone_number': profile.phone_number,
                            'role': profile.role,
                            'organization': profile.organization,
                            'investor_type': profile.investor_type,
                            'created_at': profile.created_at.isoformat() if profile.created_at else None,
                            'updated_at': profile.updated_at.isoformat() if profile.updated_at else None
                        }
                    }
                    
                    logger.info(f"Login successful for user: {user.email}")
                    
                    return Response({
                        'success': True,
                        'message': 'Login successful',
                        'user': user_data,
                        'access': str(access_token),
                        'refresh': str(refresh)
                    }, status=status.HTTP_200_OK)
                    
            except Exception as e:
                logger.error(f"OTP verification error: {str(e)}")
                logger.error(f"Traceback: {traceback.format_exc()}")
                return Response({
                    'success': False,
                    'errors': {'general': 'Failed to verify OTP. Please try again.'}
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except User.DoesNotExist:
            logger.warning(f"User not found for OTP verification: {username}")
            return Response({
                'success': False,
                'errors': {'general': 'User not found'}
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        logger.error(f"OTP verification view error: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return Response({
            'success': False,
            'errors': {'general': 'An error occurred during verification. Please try again.'}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def resend_login_otp(request):
    """Resend OTP for login verification"""
    try:
        username = request.data.get('username')
        
        logger.info(f"OTP resend request for username: {username}")
        
        if not username:
            return Response({
                'success': False,
                'errors': {'general': 'Username is required'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(username=username)
            
            # Delete existing OTPs for this user
            deleted_count = OTPToken.objects.filter(user=user).count()
            OTPToken.objects.filter(user=user).delete()
            logger.info(f"Deleted {deleted_count} existing OTPs for user {user.email}")
            
            # Create new OTP
            with transaction.atomic():
                otp = OTPToken.objects.create(
                    user=user,
                    otp_expires_at=timezone.now() + timedelta(minutes=5)
                )
                logger.info(f"Created new OTP {otp.otp_code} for user {user.email}")
                
                # Send OTP email
                message = f"""
                Hello {user.username},

                Your One-Time Password (OTP) is: {otp.otp_code}

                This code will expire in 5 minutes. Please enter it to proceed with your login.

                Thank you,
                Agriconnect
                """

                
                if not hasattr(settings, 'EMAIL_HOST_USER') or not settings.EMAIL_HOST_USER:
                    logger.warning("EMAIL_HOST_USER not configured, skipping email send")
                    # For development - just log the OTP
                    logger.info(f"DEV MODE - New OTP for {user.email}: {otp.otp_code}")
                else:
                    email_message = EmailMessage(
                        "Login Verification - New OTP",
                        message,
                        settings.EMAIL_HOST_USER,
                        [user.email]
                    )
                    email_message.send(fail_silently=False)
                    logger.info(f"New OTP email sent to {user.email}")
                
                return Response({
                    'success': True,
                    'message': 'New OTP has been sent to your email'
                }, status=status.HTTP_200_OK)
                
        except User.DoesNotExist:
            logger.warning(f"User not found for resend OTP: {username}")
            return Response({
                'success': False,
                'errors': {'general': 'User not found'}
            }, status=status.HTTP_404_NOT_FOUND)
            
        except Exception as e:
            logger.error(f"OTP resend error: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response({
                'success': False,
                'errors': {'general': 'Failed to send OTP. Please try again.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        logger.error(f"Resend OTP view error: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return Response({
            'success': False,
            'errors': {'general': 'An error occurred. Please try again.'}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
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

            one_day_ago = timezone.now() - timedelta(days=1)
            reset_count = PasswordReset.objects.filter(user=user, created_when__gte=one_day_ago).count()

            if reset_count >= 5:
                return Response({
                    'success': False,
                    'errors': {'limit': 'You have reached the maximum of 5 password reset requests in the last 24 hours.'}
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)

            PasswordReset.objects.filter(user=user, created_when__lt=one_day_ago).delete()

            reset_instance = PasswordReset.objects.create(user=user)
            reset_link = f"{request.scheme}://{request.get_host()}{reverse('reset-password', args=[reset_instance.reset_id])}"
            
            email_subject = "Reset Your Password"
            email_body = (
                f"Hello {user.username},\n\n"
                f"We received a request to reset your password.\n"
                f"Click the link below to set a new one:\n\n"
                f"{reset_link}\n\n"
                f"This link will expire in 10 minutes.\n"
                f"If you didn’t request this, please ignore this email."
            )


            email_message = EmailMessage(
                email_subject,
                email_body,
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
    '''View to reset password'''
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


# VIEWS TO GET TO KNOW YOUR CUSTOMER

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
        elif action == 'rejected':
            kyc.is_verified = False
            kyc.verification_date = None
        else:  
            kyc.is_verified = False
            kyc.verification_date = None
        
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