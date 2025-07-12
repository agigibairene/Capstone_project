from datetime import timedelta
import os
from django.utils import timezone
import secrets
from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
import uuid
from django.core.validators import MinValueValidator
from django.forms import ValidationError
from .watermark import watermark_pdf
import logging

logger = logging.getLogger(__name__)


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('Farmer', 'Farmer'),
        ('Investor', 'Investor'),
    ]
    
    INVESTOR_TYPE_CHOICES = [
        ('Individual', 'Individual'),
        ('Organization', 'Organization'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    organization = models.CharField(max_length=200, blank=True)
    investor_type = models.CharField(max_length=15, choices=INVESTOR_TYPE_CHOICES, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_autofill_data(self):
        """Get autofill data for KYC forms"""
        return {
            'full_name': f"{self.user.first_name} {self.user.last_name}".strip(),
            'email': self.user.email,
            'phone_number': self.phone_number,
            'role': self.role,
        }

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.role}"

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"
        
        
class InvestorKYC(models.Model):
    """KYC information for investors - Immutable once created"""

    ID_TYPE_CHOICES = [
        ('passport', 'Passport'),
        ('national_id', 'National ID'),
        ('driver_license', 'Driver\'s License'),
    ]

    INCOME_SOURCE_CHOICES = [
        ('salary', 'Salary'),
        ('business', 'Business'),
        ('investment', 'Investment'),
        ('other', 'Other'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='investor_kyc')

    full_name = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    nationality = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField()

    id_type = models.CharField(max_length=20, choices=ID_TYPE_CHOICES)
    id_number = models.CharField(max_length=100)
    id_document = models.FileField(upload_to='documents/id/')
    profile_picture = models.ImageField(upload_to='profiles/')

    address = models.TextField()
    occupation = models.CharField(max_length=200)
    income_source = models.CharField(max_length=20, choices=INCOME_SOURCE_CHOICES)
    annual_income = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    purpose = models.TextField(help_text="Purpose of the investment account")

    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(null=True, blank=True)
    changes_allowed = models.BooleanField(default=False)  

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        """Override save to prevent updates after creation except allowed fields"""
        if self.pk is not None:
            original = InvestorKYC.objects.get(pk=self.pk)
            admin_updatable_fields = ['is_verified', 'verification_date', 'changes_allowed']

            for field in self._meta.fields:
                field_name = field.name
                if field_name not in admin_updatable_fields and field_name not in ['updated_at']:
                    old_value = getattr(original, field_name)
                    new_value = getattr(self, field_name)
                    if old_value != new_value:
                        raise ValidationError(f"KYC data is immutable. Cannot update field: {field_name}")

        super().save(*args, **kwargs)

    def __str__(self):
        return f"KYC for {self.full_name} - {'Verified' if self.is_verified else 'Pending'}"

    class Meta:
        verbose_name = "Investor KYC"
        verbose_name_plural = "Investor KYCs"


class FarmerKYC(models.Model):
    """KYC information for farmers/project seekers - Immutable once created"""

    ROLE_CHOICES = [
        ('Student', 'Student'),
        ('Farmer', 'Farmer'),
        ('Entrepreneur', 'Entrepreneur'),
        ('Other', 'Other'),
    ]

    ID_TYPE_CHOICES = [
        ('National ID', 'National ID'),
        ('Passport', 'Passport'),
        ('Driver\'s License', 'Driver\'s License'),
        ('Voter ID', 'Voter ID'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='farmer_kyc')

    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    date_of_birth = models.DateField()
    nationality = models.CharField(max_length=100)

    background = models.TextField(help_text="Brief background information")
    address = models.TextField(help_text="Complete address")

    id_type = models.CharField(max_length=20, choices=ID_TYPE_CHOICES)
    id_number = models.CharField(max_length=100)
    id_document = models.FileField(upload_to='documents/id/')
    profile_picture = models.ImageField(upload_to='profiles/')

    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(null=True, blank=True)
    changes_allowed = models.BooleanField(default=False)  # New field to allow changes post-verification

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        """Override save to prevent updates after creation except allowed fields"""
        if self.pk is not None:
            original = FarmerKYC.objects.get(pk=self.pk)
            admin_updatable_fields = ['is_verified', 'verification_date', 'changes_allowed']

            for field in self._meta.fields:
                field_name = field.name
                if field_name not in admin_updatable_fields and field_name not in ['updated_at']:
                    old_value = getattr(original, field_name)
                    new_value = getattr(self, field_name)
                    if old_value != new_value:
                        raise ValidationError(f"KYC data is immutable. Cannot update field: {field_name}")

        super().save(*args, **kwargs)

    
    def __str__(self):
        return f"KYC for {self.full_name} - {'Verified' if self.is_verified else 'Pending'}"

    class Meta:
        verbose_name = "Farmer KYC"
        verbose_name_plural = "Farmer KYCs"


class KYCVerificationLog(models.Model):
    """Log of KYC verification actions"""
    
    ACTION_CHOICES = [
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('pending', 'Pending Review'),
        ('updated', 'Updated'),
        ('change_requested', 'Change Requested'),  # New action type
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    admin_user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='kyc_actions'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.action} at {self.created_at}"

    class Meta:
        verbose_name = "KYC Verification Log"
        verbose_name_plural = "KYC Verification Logs"
        ordering = ['-created_at']


class PasswordReset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reset_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_when = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Password reset for {self.user.username} at {self.created_when}"

    @classmethod
    def recent_reset_count(cls, user):
        one_day_ago = timezone.now() - timezone.timedelta(days=1)
        return cls.objects.filter(user=user, created_when__gte=one_day_ago).count()


class OTPToken(models.Model):
    """OTP Token model for authentication"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="otps"
    )
    otp_code = models.CharField(max_length=5, blank=True)
    otp_created_at = models.DateTimeField(auto_now_add=True)  
    otp_expires_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-otp_created_at']
    
    def __str__(self):
        return f"OTP for {self.user.username} - {self.otp_code}"
    
    def is_expired(self):
        """Check if OTP is expired"""
        if self.otp_expires_at:
            return timezone.now() > self.otp_expires_at
        return False
    
    def generate_otp_code(self):
        """Generate a 5-digit OTP code"""
        return str(secrets.randbelow(90000) + 10000)
    
    def save(self, *args, **kwargs):
        """Generate OTP code and set expiry time if not provided"""
        if not self.otp_code:
            self.otp_code = self.generate_otp_code()
        
        if not self.otp_expires_at:
            self.otp_expires_at = timezone.now() + timedelta(minutes=5)
        
        super().save(*args, **kwargs)
               

class Opportunity(models.Model):
    OPPORTUNITY_TYPES = [
        ('grant', 'Grant'),
        ('hackathon', 'Hackathon'),
        ('funding_mentorship', 'Funding + Mentorship'),
        ('competition', 'Competition'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=255)
    organization = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    theme = models.CharField(max_length=255)
    type = models.CharField(max_length=50, choices=OPPORTUNITY_TYPES)
    tags = models.JSONField(default=list, help_text="List of tags")
    description = models.TextField()
    full_description = models.TextField()
    amount = models.CharField(max_length=100)
    deadline = models.DateField()
    application_link = models.URLField(max_length=500, help_text="Link to application form or website")
    posted = models.DateTimeField(default=timezone.now)
    views = models.PositiveIntegerField(default=0)
    applicants = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='opportunities')
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-posted']
        verbose_name_plural = "Opportunities"
    
    def __str__(self):
        return self.title
    
    def increment_views(self):
        self.views += 1
        self.save(update_fields=['views'])

# PROJECTS

class Project(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('funded', 'Funded'),
        ('completed', 'Completed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='projects'
    )
    name = models.CharField(max_length=100)
    title = models.CharField(max_length=200)
    email = models.EmailField()
    brief = models.TextField(max_length=500)
    description = models.TextField()
    benefits = models.TextField(blank=True)
    target_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    deadline = models.DateField()
    image_url = models.URLField(blank=True, null=True)
    original_proposal = models.FileField(
        upload_to='proposals/original/',
        help_text="Upload your project proposal PDF"
    )
    watermarked_proposal = models.FileField(
        upload_to='proposals/watermarked/',
        blank=True,
        null=True,
        editable=False
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        permissions = [
            ('can_view_project', 'Can view project'),
            ('can_create_project', 'Can create project'),
        ]
        verbose_name = "Project"
        verbose_name_plural = "Projects"
    
    def __str__(self):
        return f"{self.title} by {self.farmer.username}"
    
    def save(self, *args, **kwargs):
        is_new = not self.pk
        previous_file = None

        if not is_new:
            try:
                previous_file = Project.objects.get(pk=self.pk).original_proposal
            except Project.DoesNotExist:
                pass

        super().save(*args, **kwargs)  

        proposal_changed = (
            is_new or
            (previous_file and previous_file != self.original_proposal)
        )

        if proposal_changed and self.original_proposal:
            try:
                watermarked_path = watermark_pdf(
                    self.original_proposal.path,
                    watermark_text="AGRICONNECT",
                    project_id=str(self.id)
                )

                self.watermarked_proposal.name = os.path.relpath(
                    watermarked_path, settings.MEDIA_ROOT
                )

                # Save again to persist the watermarked file path
                super().save(update_fields=['watermarked_proposal'])

            except Exception as e:
                logger.error(f"Failed to watermark proposal for project {self.id}: {str(e)}")

    @property
    def days_remaining(self):
        if self.deadline:
            delta = self.deadline - timezone.now().date()
            return max(delta.days, 0)
        return None

    @property
    def is_active(self):
        return (
            self.status in ['approved', 'funded'] and
            (self.days_remaining is None or self.days_remaining > 0)
        )

    def get_watermarked_proposal_url(self):
        if self.watermarked_proposal:
            return self.watermarked_proposal.url
        return None



class MyModel(models.Model):
    image = models.ImageField(upload_to='images/') 
    document = models.FileField(upload_to='documents/') 