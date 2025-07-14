from datetime import timedelta
import json
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, logout, get_user_model
from django.contrib.auth.models import User
from django.utils import timezone  
from django.core.mail import EmailMessage
from django.conf import settings
from django.urls import reverse
from django.db import transaction
from ..models import OTPToken,  PasswordReset, UserProfile
from ..serializers import (
    PasswordResetRequestSerializer, PasswordResetSerializer, UserLoginSerializer, UserProfileSerializer, UserSerializer, UserSignUpSerializer,UserUpdateSerializer, )
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import  HttpResponseRedirect
import logging
import traceback
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from django.http import JsonResponse


# Set up logging
logger = logging.getLogger(__name__)

User = get_user_model()

def home(request):
    return JsonResponse({"message": "Welcome to Agriconnect API!"})

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from django.core.mail import EmailMessage
from django.conf import settings
import traceback
import json
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    """User signup view"""
    try:    
        data = request.data if hasattr(request, 'data') else json.loads(request.body)
        
        serializer = UserSignUpSerializer(data=data)
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    user = serializer.save()
                    
                    try:
                        profile = user.profile
                    except UserProfile.DoesNotExist:
                        profile = UserProfile.objects.create(
                            user=user,
                            phone_number=data.get('phone_number', ''),
                            role=data.get('role', 'Farmer'),
                            organization=data.get('organization', ''),
                            investor_type=data.get('investor_type', '')
                        )
                        logger.info(f"Created profile for user {user.email}: {profile}")
                    
                    # Generate tokens
                    refresh = RefreshToken.for_user(user)
                    
                    # Serialize user data
                    user_data = UserSerializer(user).data
                    
                    logger.info(f"User {user.email} registered successfully")
                    
                    return Response({
                        'success': True, 
                        'message': 'Account created successfully',
                        'user': user_data,
                        'access': str(refresh.access_token),
                        'refresh': str(refresh)
                    }, status=status.HTTP_201_CREATED)
                    
            except Exception as e:
                logger.error(f"Error creating user: {str(e)}")
                logger.error(f"Traceback: {traceback.format_exc()}")
                return Response({
                    'success': False, 
                    'errors': {'general': 'Failed to create account. Please try again.'}
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        logger.warning(f"Signup validation failed: {serializer.errors}")
        return Response({
            'success': False, 
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Signup view error: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return Response({
            'success': False, 
            'errors': {'general': 'An error occurred during registration. Please try again.'}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
                        
                        message =  (
                        f"Hello {user.first_name},\n\n"
                        f"Your One-Time Password (OTP) is: {otp.otp_code}\n\n"
                        f"This code will expire in 5 minutes. Please enter it to proceed with your login.\n\n"
                        f"Thank you,\n"
                        f"Agriconnect"
                        )
                                                    
                        if not hasattr(settings, 'EMAIL_HOST_USER') or not settings.EMAIL_HOST_USER:
                            logger.warning("EMAIL_HOST_USER not configured, skipping email send")
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

        logger.info(f"OTP verification attempt for username: {username}, OTP: {otp_code}")

        if not username or not otp_code:
            return Response({
                'success': False, 
                'errors': {'general': 'Username and OTP code are required'}
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(username=username)
            logger.info(f"User found: {user.email}")

            otp_token = OTPToken.objects.filter(user=user).order_by('-otp_created_at').first()

            if not otp_token:
                logger.warning(f"No OTP found for user: {user.email}")
                return Response({
                    'success': False,
                    'errors': {'general': 'No OTP found. Please request a new one.'}
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                if otp_token.is_expired():
                    logger.warning(f"Expired OTP for user: {user.email}")
                    otp_token.delete()
                    return Response({
                        'success': False,
                        'errors': {'general': 'OTP has expired. Please request a new one.'}
                    }, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Error checking OTP expiration: {e}")
                logger.error(traceback.format_exc())
                return Response({
                    'success': False,
                    'errors': {'general': 'OTP verification failed. Please try again.'}
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

        except User.DoesNotExist:
            logger.warning(f"User not found for OTP verification: {username}")
            return Response({
                'success': False,
                'errors': {'general': 'User not found'}
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Error during OTP validation logic: {e}")
            logger.error(traceback.format_exc())
            return Response({
                'success': False,
                'errors': {'general': 'Unexpected error during OTP validation.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        logger.error(f"OTP verification view error: {e}")
        logger.error(traceback.format_exc())
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
                message =  (
                f"Hello {user.first_name},\n\n"
                f"Your One-Time Password (OTP) is: {otp.otp_code}\n\n"
                f"This code will expire in 5 minutes. Please enter it to proceed with your login.\n\n"
                f"Thank you,\n"
                f"Agriconnect"
                )
                
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
    try:
        logout(request)
        return Response({
            'success': True, 
            'message': 'Logged out successfully'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return Response({
            'success': False,
            'errors': {'general': 'Error during logout'}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
                f"Hello {user.first_name},\n\n"
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
        frontend_url = f"https://agriconnect-frontend-rzd2q.ondigitalocean.app/reset/{reset_id}"
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


# ADMINISTRATOR
