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
from .models import PasswordReset
from .serializers import (UserSignUpSerializer, UserLoginSerializer
, PasswordResetRequestSerializer, PasswordResetSerializer
)

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    serializer = UserSignUpSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'success': True, 'message': 'Account created successfully'})
    return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = authenticate(request, username=serializer.validated_data['email'], password=serializer.validated_data['password'])
        if user:
            login(request, user)
            return Response({
                'success': True,
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            })
        return Response({'success': False, 'errors': {'general': 'Invalid credentials'}}, status=status.HTTP_401_UNAUTHORIZED)
    return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({'success': True, 'message': 'Logged out successfully'})


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_view(request):
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = User.objects.get(email=serializer.validated_data['email'])
            reset_instance = PasswordReset.objects.create(user=user)
            reset_link = f"{request.scheme}://{request.get_host()}{reverse('reset-password', args=[reset_instance.reset_id])}"

            email_message = EmailMessage(
                'Reset your password',
                f'Reset your password using the link:\n\n{reset_link}',
                settings.EMAIL_HOST_USER,
                [user.email]
            )
            email_message.send(fail_silently=True)

            return Response({'success': True, 'message': 'Password reset email sent'})
        except User.DoesNotExist:
            return Response({'success': False, 'errors': {'email': 'Email not found'}}, status=status.HTTP_404_NOT_FOUND)
    return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_view(request, reset_id):
    serializer = PasswordResetSerializer(data=request.data)
    if serializer.is_valid():
        try:
            reset_instance = PasswordReset.objects.get(reset_id=reset_id)
            if timezone.now() > reset_instance.created_when + timezone.timedelta(minutes=10):
                reset_instance.delete()
                return Response({'success': False, 'errors': {'general': 'Reset link expired'}}, status=status.HTTP_400_BAD_REQUEST)

            user = reset_instance.user
            user.set_password(serializer.validated_data['password'])
            user.save()
            reset_instance.delete()
            return Response({'success': True, 'message': 'Password reset successful'})
        except PasswordReset.DoesNotExist:
            return Response({'success': False, 'errors': {'general': 'Invalid reset ID'}}, status=status.HTTP_404_NOT_FOUND)
    return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
