from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import UserProfile

# Updated serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    
    class Meta:
        model = UserProfile
        fields = ['phone_number', 'role', 'organization', 'investor_type']
        extra_kwargs = {
            'role': {'required': True},
            'phone_number': {'required': True, 'allow_blank': True},
            'organization': {'required': False, 'allow_blank': True},
            'investor_type': {'required': False, 'allow_blank': True},
        }

class UserSerializer(serializers.ModelSerializer):
    """Basic User serializer for responses"""
    # Use the correct related_name from the model
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'profile']
        read_only_fields = ['id', 'username', 'date_joined']

class UserSignUpSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    role = serializers.CharField(required=True)
    organization = serializers.CharField(required=False, allow_blank=True)
    investor_type = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email', 'password', 'confirm_password',
            'phone_number', 'role', 'organization', 'investor_type'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
        }

    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})

        # Validate password strength
        try:
            validate_password(attrs['password'])
        except ValidationError as e:
            raise serializers.ValidationError({"password": e.messages})

        return attrs

    def create(self, validated_data):
        """Create user and profile"""
        # Extract profile-related fields
        phone_number = validated_data.pop('phone_number', '')
        role = validated_data.pop('role')
        organization = validated_data.pop('organization', '')
        investor_type = validated_data.pop('investor_type', '')
        validated_data.pop('confirm_password')

        email = validated_data['email']

        # Create user with email as username
        user = User.objects.create_user(
            username=email,
            email=email,
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password']
        )

        # Create user profile - ENSURE IT'S CREATED
        profile = UserProfile.objects.create(
            user=user,
            phone_number=phone_number,
            role=role,
            organization=organization,
            investor_type=investor_type
        )
        
        print(f"Created profile for user {user.email}: {profile}")  # Debug log

        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        """Check if user with email exists"""
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError(f"No user with email '{value}' found")
        return value


class PasswordResetSerializer(serializers.Serializer):
    """Serializer for password reset confirmation"""
    password = serializers.CharField(required=True, min_length=6, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})
        
        # Validate password strength
        try:
            validate_password(attrs['password'])
        except ValidationError as e:
            raise serializers.ValidationError({"password": e.messages})
        
        return attrs


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user information (role cannot be changed)"""
    profile = UserProfileSerializer(source='userprofile', required=False)
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'profile']
        extra_kwargs = {
            'email': {'required': False},
        }

    def validate_email(self, value):
        """Check if email already exists for other users"""
        if self.instance and User.objects.filter(email=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def update(self, instance, validated_data):
        """Update user and profile (excluding role)"""
        profile_data = validated_data.pop('userprofile', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if profile_data:
            profile = instance.userprofile
            profile_data.pop('role', None)
            
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        
        return instance