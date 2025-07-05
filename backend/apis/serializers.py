from datetime import date
from django.conf import settings
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import InvestorKYC, FarmerKYC, KYCVerificationLog, Opportunity, Project, UserProfile
from .opportunities import schedule_opportunity_cleanup
from .watermark import watermark_pdf
import os
import logging
from django.conf import settings


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
    profile = UserProfileSerializer(source='userprofile', read_only=True)
    
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

        # Create user profile
        try:
            profile = UserProfile.objects.create(
                user=user,
                phone_number=phone_number,
                role=role,
                organization=organization,
                investor_type=investor_type
            )
            print(f"Created profile for user {user.email}: {profile}")
        except Exception as e:
            # If profile creation fails, delete the user to maintain consistency
            user.delete()
            raise serializers.ValidationError(f"Failed to create user profile: {str(e)}")

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
            try:
                profile = instance.userprofile
                # Don't allow role changes through this serializer
                profile_data.pop('role', None)
                
                for attr, value in profile_data.items():
                    setattr(profile, attr, value)
                profile.save()
            except UserProfile.DoesNotExist:
                # Create profile if it doesn't exist
                UserProfile.objects.create(
                    user=instance,
                    phone_number=profile_data.get('phone_number', ''),
                    role=profile_data.get('role', 'Farmer'),
                    organization=profile_data.get('organization', ''),
                    investor_type=profile_data.get('investor_type', '')
                )
        
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
            'id_document': {'required': True},
            'profile_picture': {'required': True},
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
        )
        
        return super().create(validated_data)


class FarmerKYCSerializer(serializers.ModelSerializer):
    """Serializer for Farmer KYC data - Read-only after creation"""
    
    class Meta:
        model = FarmerKYC
        fields = [
            'id', 'full_name', 'email', 'phone_number', 'role', 
            'date_of_birth', 'nationality', 'background', 'address',
            'id_type', 'id_number', 'id_document', 'profile_picture',
            'is_verified', 'verification_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_verified', 'verification_date', 'created_at', 'updated_at']
        extra_kwargs = {
            'full_name': {'required': True},
            'email': {'required': True},
            'phone_number': {'required': True},
            'role': {'required': True},
            'date_of_birth': {'required': True},
            'nationality': {'required': True},
            'background': {'required': True},
            'address': {'required': True},
            'id_type': {'required': True},
            'id_number': {'required': True},
            'id_document': {'required': True},
            'profile_picture': {'required': True},
        }

    def validate_date_of_birth(self, value):
        """Validate that user is at least 18 years old"""
        today = date.today()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        
        if age < 18:
            raise serializers.ValidationError("You must be at least 18 years old to register.")
        
        return value

    def validate_email(self, value):
        """Validate email format and uniqueness within KYC records"""
        if self.instance is None:  
            if FarmerKYC.objects.filter(email=value).exists():
                raise serializers.ValidationError("A KYC record with this email already exists.")
        return value

    def validate_phone_number(self, value):
        """Basic phone number validation"""
        if not value.replace('+', '').replace('-', '').replace(' ', '').isdigit():
            raise serializers.ValidationError("Please enter a valid phone number.")
        return value

    def validate_id_number(self, value):
        """Validate ID number uniqueness"""
        if self.instance is None:  
            if FarmerKYC.objects.filter(id_number=value).exists():
                raise serializers.ValidationError("A KYC record with this ID number already exists.")
        return value

    def validate_id_document(self, value):
        """Validate ID document file"""
        if value:
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("ID document file size must be less than 5MB.")
            
            allowed_extensions = ['.pdf', '.jpg', '.jpeg', '.png']
            if not any(value.name.lower().endswith(ext) for ext in allowed_extensions):
                raise serializers.ValidationError("ID document must be a PDF, JPG, JPEG, or PNG file.")
        
        return value

    def validate_profile_picture(self, value):
        """Validate profile picture file"""
        if value:
            if value.size > 2 * 1024 * 1024:
                raise serializers.ValidationError("Profile picture file size must be less than 2MB.")
            
            allowed_extensions = ['.jpg', '.jpeg', '.png']
            if not any(value.name.lower().endswith(ext) for ext in allowed_extensions):
                raise serializers.ValidationError("Profile picture must be a JPG, JPEG, or PNG file.")
        
        return value

    def update(self, instance, validated_data):
        """Prevent updates to KYC data"""
        raise serializers.ValidationError("KYC data cannot be updated once submitted. Please contact support if changes are needed.")

    def create(self, validated_data):
        """Create farmer KYC record"""
        user = self.context['request'].user
        validated_data['user'] = user
        
        kyc_instance = super().create(validated_data)
        
        try:
            KYCVerificationLog.objects.create(
                user=user,
                action='submitted',
            )
        except Exception as e:
            print(f"Failed to create verification log: {str(e)}")
        
        return kyc_instance


class KYCVerificationLogSerializer(serializers.ModelSerializer):
    """Serializer for KYC verification logs"""
    admin_username = serializers.CharField(source='admin_user.username', read_only=True)
    
    class Meta:
        model = KYCVerificationLog
        fields = ['id', 'action', 'admin_username', 'created_at']
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
    allow_changes = serializers.BooleanField(default=False, help_text="Allow one-time changes to KYC data")
    
    
class OpportunitySerializer(serializers.ModelSerializer):
    posted = serializers.SerializerMethodField()
    
    class Meta:
        model = Opportunity
        fields = [
            'id', 'title', 'organization', 'location', 'theme', 'type', 
            'tags', 'description', 'full_description', 'amount', 
            'deadline', 'application_link', 'posted', 'views', 'applicants'
        ]
    
    def get_posted(self, obj):
        now = timezone.now()
        diff = now - obj.posted
        
        if diff.days == 0:
            return "Today"
        elif diff.days == 1:
            return "1 day ago"
        elif diff.days < 7:
            return f"{diff.days} days ago"
        elif diff.days < 14:
            return "1 week ago"
        elif diff.days < 30:
            return f"{diff.days // 7} weeks ago"
        else:
            return f"{diff.days // 30} months ago"


class OpportunityCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Opportunity
        fields = [
            'title', 'organization', 'location', 'theme', 'type', 
            'tags', 'description', 'full_description', 'amount', 'deadline',
            'application_link'
        ]
    
    def validate_deadline(self, value):
        """Ensure deadline is not in the past"""
        if value < timezone.now().date():
            raise serializers.ValidationError("Deadline cannot be in the past.")
        return value
    
    def validate_tags(self, value):
        """Ensure tags is a list"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Tags must be a list.")
        return value
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        opportunity = super().create(validated_data)
        
        schedule_opportunity_cleanup.delay(opportunity.id)
        
        return opportunity
    

# PROJECT SERIALIZER

class ProjectSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.get_full_name', read_only=True)
    days_remaining = serializers.SerializerMethodField()
    is_farmer = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'farmer', 'farmer_name', 'name', 'title', 'email', 
            'brief', 'description', 'benefits', 'target_amount', 
            'deadline', 'days_remaining', 'image_url', 
            'watermarked_proposal', 'status', 'created_at', 'is_farmer'
        ]
        read_only_fields = [
            'id', 'farmer', 'farmer_name', 'status', 'created_at', 
            'updated_at', 'watermarked_proposal', 'days_remaining',
            'is_farmer'
        ]
    
    def get_days_remaining(self, obj):
        if obj.deadline:
            delta = obj.deadline - timezone.now().date()
            return max(delta.days, 0)
        return None
    
    def get_is_farmer(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return hasattr(request.user, 'profile') and request.user.profile.role == 'Farmer'
        return False





class ProjectCreateSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True)

    class Meta:
        model = Project
        fields = [
            'name', 'title', 'email', 'brief', 'description',
            'benefits', 'target_amount', 'deadline', 'image_url', 'file'
        ]

    def create(self, validated_data):
        file = validated_data.pop('file')
        farmer = self.context['request'].user

        validated_data.pop('farmer', None)

        project = Project.objects.create(
            farmer=farmer,
            original_proposal=file,
            **validated_data
        )

        if project.original_proposal:
            try:
                watermarked_path = watermark_pdf(
                    input_path=project.original_proposal.path,
                    watermark_text="Agriconnect",
                    project_id=str(project.id)
                )
                project.watermarked_proposal.name = os.path.relpath(
                    watermarked_path, settings.MEDIA_ROOT
                )
                project.save(update_fields=['watermarked_proposal'])

            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to watermark proposal for project {project.id}: {str(e)}")

        return project
