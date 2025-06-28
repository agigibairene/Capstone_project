from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import InvestorKYC, FarmerKYC, KYCVerificationLog, UserProfile


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

        try:
            validate_password(attrs['password'])
        except ValidationError as e:
            raise serializers.ValidationError({"password": e.messages})

        return attrs

    def create(self, validated_data):
        """Create user and profile"""
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

        profile = UserProfile.objects.create(
            user=user,
            phone_number=phone_number,
            role=role,
            organization=organization,
            investor_type=investor_type
        )
        
        print(f"Created profile for user {user.email}: {profile}")  

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
    

class InvestorKYCSerializer(serializers.ModelSerializer):
    """Serializer for Investor KYC data - Read-only after creation"""
    
    class Meta:
        model = InvestorKYC
        fields = [
            'id', 'full_name', 'date_of_birth', 'nationality', 'phone_number',
            'id_type', 'id_number', 'id_document', 'profile_picture',
            'address', 'occupation', 'income_source', 'annual_income', 'purpose',
            'is_verified', 'verification_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_verified', 'verification_date', 'created_at', 'updated_at']
        extra_kwargs = {
            'full_name': {'required': True},
            'date_of_birth': {'required': True},
            'nationality': {'required': True},
            'phone_number': {'required': True},
            'id_type': {'required': True},
            'id_number': {'required': True},
            'address': {'required': True},
            'occupation': {'required': True},
            'income_source': {'required': True},
            'annual_income': {'required': True},
            'purpose': {'required': True},
        }

    def validate_annual_income(self, value):
        """Validate annual income is positive"""
        if value <= 0:
            raise serializers.ValidationError("Annual income must be greater than 0")
        return value

    def update(self, instance, validated_data):
        """Prevent updates to KYC data"""
        raise serializers.ValidationError("KYC data cannot be updated once submitted. Please contact support if changes are needed.")

    def create(self, validated_data):
        """Create investor KYC record"""
        user = self.context['request'].user
        validated_data['user'] = user
        
        # Create verification log
        KYCVerificationLog.objects.create(
            user=user,
            action='submitted',
            notes='Investor KYC submitted for review'
        )
        
        return super().create(validated_data)


class FarmerKYCSerializer(serializers.ModelSerializer):
    """Serializer for Farmer KYC data - Read-only after creation"""
    
    class Meta:
        model = FarmerKYC
        fields = [
            'id', 'full_name', 'email', 'phone_number', 'role', 'background',
            'project_title', 'project_description', 'estimated_budget', 
            'funding_needed', 'location', 'project_document',
            'is_verified', 'verification_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_verified', 'verification_date', 'created_at', 'updated_at']
        extra_kwargs = {
            'full_name': {'required': True},
            'email': {'required': True},
            'phone_number': {'required': True},
            'role': {'required': True},
            'background': {'required': True},
            'project_title': {'required': True},
            'project_description': {'required': True},
            'estimated_budget': {'required': True},
            'funding_needed': {'required': True},
            'location': {'required': True},
        }

    def validate_funding_needed(self, value):
        """Validate funding needed is positive"""
        if value <= 0:
            raise serializers.ValidationError("Funding needed must be greater than 0")
        return value

    def validate_estimated_budget(self, value):
        """Validate estimated budget is positive"""
        if value <= 0:
            raise serializers.ValidationError("Estimated budget must be greater than 0")
        return value

    def validate(self, attrs):
        """Validate that funding needed doesn't exceed estimated budget"""
        funding_needed = attrs.get('funding_needed')
        estimated_budget = attrs.get('estimated_budget')
        
        if funding_needed and estimated_budget and funding_needed > estimated_budget:
            raise serializers.ValidationError({
                'funding_needed': 'Funding needed cannot exceed estimated budget'
            })
        
        return attrs

    def update(self, instance, validated_data):
        """Prevent updates to KYC data"""
        raise serializers.ValidationError("KYC data cannot be updated once submitted. Please contact support if changes are needed.")

    def create(self, validated_data):
        """Create farmer KYC record"""
        user = self.context['request'].user
        validated_data['user'] = user
        
        KYCVerificationLog.objects.create(
            user=user,
            action='submitted',
            notes='Farmer KYC submitted for review'
        )
        
        return super().create(validated_data)


class KYCVerificationLogSerializer(serializers.ModelSerializer):
    """Serializer for KYC verification logs"""
    admin_username = serializers.CharField(source='admin_user.username', read_only=True)
    
    class Meta:
        model = KYCVerificationLog
        fields = ['id', 'action', 'notes', 'admin_username', 'created_at']
        read_only_fields = ['id', 'created_at']


class KYCStatusSerializer(serializers.Serializer):
    """Serializer for KYC status response"""
    has_kyc = serializers.BooleanField()
    kyc_type = serializers.CharField(allow_null=True)
    is_verified = serializers.BooleanField()
    verification_date = serializers.DateTimeField(allow_null=True)
    submitted_date = serializers.DateTimeField(allow_null=True)


class KYCAdminUpdateSerializer(serializers.Serializer):
    """Serializer for admin KYC updates"""
    action = serializers.ChoiceField(choices=['approved', 'rejected', 'pending'])
    notes = serializers.CharField(required=False, allow_blank=True)
    allow_changes = serializers.BooleanField(default=False, help_text="Allow one-time changes to KYC data")

