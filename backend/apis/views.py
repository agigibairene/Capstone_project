from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
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
    UserProfileSerializer, 
    UserSignUpSerializer, 
    UserLoginSerializer,
    PasswordResetRequestSerializer, 
    PasswordResetSerializer,
    UserSerializer,
    UserUpdateSerializer
)
from rest_framework_simplejwt.tokens import RefreshToken


@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    """User registration endpoint"""
    serializer = UserSignUpSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'success': True, 
            'message': 'Account created successfully',
            'user_id': user.id
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

            # Ensure profile exists
            try:
                profile = user.profile
                if not profile:
                    raise UserProfile.DoesNotExist
            except UserProfile.DoesNotExist:
                # Create a default profile if it doesn't exist
                UserProfile.objects.create(
                    user=user,
                    phone_number='',
                    role='Farmer',  # Default role
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


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_view(request, reset_id):
    """Password reset confirmation endpoint"""
    serializer = PasswordResetSerializer(data=request.data)
    if serializer.is_valid():
        try:
            reset_instance = PasswordReset.objects.get(reset_id=reset_id)
            
            # Check if reset link has expired (10 minutes)
            expiration_time = reset_instance.created_when + timezone.timedelta(minutes=10)
            if timezone.now() > expiration_time:
                reset_instance.delete()
                return Response({
                    'success': False, 
                    'errors': {'general': 'Reset link has expired'}
                }, status=status.HTTP_400_BAD_REQUEST)

            # Reset password
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


