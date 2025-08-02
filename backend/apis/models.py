from datetime import timedelta
from django.utils import timezone
import secrets
from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
import uuid
from django.core.validators import MinValueValidator
from django.forms import ValidationError
from django.utils.safestring import mark_safe
from backend.storage_backends import MediaStorage
import logging

logger = logging.getLogger(__name__)

S3_STORAGE = settings.ENV == 'production'


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
    id_document = models.FileField(upload_to='documents/id/', storage=MediaStorage() if S3_STORAGE else None)
    profile_picture = models.ImageField(upload_to='profiles/', storage=MediaStorage() if S3_STORAGE else None)

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
        """Allow file uploads (id_document, profile_picture) while blocking other updates"""
        if self.pk is not None:
            try:
                original = InvestorKYC.objects.get(pk=self.pk)
                admin_updatable_fields = ['is_verified', 'verification_date', 'changes_allowed']
                file_fields = ['id_document', 'profile_picture']  

                for field in self._meta.fields:
                    field_name = field.name
                    if field_name not in admin_updatable_fields + file_fields + ['updated_at']:
                        old_value = getattr(original, field_name)
                        new_value = getattr(self, field_name)
                        if old_value != new_value:
                            raise ValidationError(f"KYC data is immutable. Cannot update field: {field_name}")
            except InvestorKYC.DoesNotExist:
                pass  

        super().save(*args, **kwargs)

    def update_verification_status(self, action, admin_user, notes=''):
        """Update KYC verification status and log it"""
        if action == 'approved':
            self.is_verified = True
            self.verification_date = timezone.now()
            self.changes_allowed = False
        elif action == 'rejected':
            self.is_verified = False
            self.verification_date = None
            self.changes_allowed = False
        elif action == 'change_requested':
            self.is_verified = False
            self.verification_date = None
            self.changes_allowed = True
        elif action == 'pending':
            self.is_verified = False
            self.verification_date = None
            self.changes_allowed = False

        self.save()

        return KYCVerificationLog.objects.create(
            user=self.user,
            action=action,
            admin_user=admin_user
        )

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
    id_document = models.FileField(upload_to='documents/id/', storage=MediaStorage() if S3_STORAGE else None)
    profile_picture = models.ImageField(upload_to='profiles/', storage=MediaStorage() if S3_STORAGE else None)

    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(null=True, blank=True)
    changes_allowed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        """Allow file uploads (id_document, profile_picture) while blocking other updates"""
        if self.pk is not None:
            try:
                original = FarmerKYC.objects.get(pk=self.pk)
                admin_updatable_fields = ['is_verified', 'verification_date', 'changes_allowed']
                file_fields = ['id_document', 'profile_picture']  

                for field in self._meta.fields:
                    field_name = field.name
                    if field_name not in admin_updatable_fields + file_fields + ['updated_at']:
                        old_value = getattr(original, field_name)
                        new_value = getattr(self, field_name)
                        if old_value != new_value:
                            raise ValidationError(f"KYC data is immutable. Cannot update field: {field_name}")
            except FarmerKYC.DoesNotExist:
                pass  # New instance, allow creation

        super().save(*args, **kwargs)

    def update_verification_status(self, action, admin_user, notes=''):
        """Update KYC verification status and log it"""
        if action == 'approved':
            self.is_verified = True
            self.verification_date = timezone.now()
            self.changes_allowed = False
        elif action == 'rejected':
            self.is_verified = False
            self.verification_date = None
            self.changes_allowed = False
        elif action == 'change_requested':
            self.is_verified = False
            self.verification_date = None
            self.changes_allowed = True
        elif action == 'pending':
            self.is_verified = False
            self.verification_date = None
            self.changes_allowed = False

        self.save()

        return KYCVerificationLog.objects.create(
            user=self.user,
            action=action,
            admin_user=admin_user
        )

    def __str__(self):
        return f"KYC for {self.full_name} - {'Verified' if self.is_verified else 'Pending'}"

    class Meta:
        verbose_name = "Farmer KYC"
        verbose_name_plural = "Farmer KYCs"


class KYCVerificationLog(models.Model):
    ACTION_CHOICES = [
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('pending', 'Pending'),
        ('submitted', 'Submitted'),  # Added this choice
        ('change_requested', 'Change Requested'),  # Added this choice
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    admin_user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,  # Added blank=True
        related_name='kyc_verification_actions'
    )
    created_at = models.DateTimeField(auto_now_add=True)  # Changed from timestamp to created_at

    def __str__(self):
        return f"{self.user.username} - {self.action} at {self.created_at}"

    class Meta:
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
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('funded', 'Funded'),
        ('completed', 'Completed'),
    ]
    
    PROJECT_TYPE = [
        ('new', 'New Project Idea'),
        ('existing', 'Existing Project (needs funding)')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='projects'
    )
    title = models.CharField(max_length=200)
    project_type = models.CharField(max_length=10, choices=PROJECT_TYPE)
    brief = models.TextField(max_length=500)
    description = models.TextField()
    benefits = models.TextField(blank=True)
    target_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    deadline = models.DateField()
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
    original_business_plan = models.FileField(
        upload_to='proposals/original/',
        help_text='Upload your business plan PDF'
    )
    watermarked_business_plan = models.FileField(
        upload_to='proposals/watermarked/',
        blank=True,
        editable=False
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        blank=False,
        null=False
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

    @property
    def is_active(self):
        return (
            self.status in ['approved', 'funded'] and
            (self.days_remaining is None or self.days_remaining > 0)
        )


class MyModel(models.Model):
    image = models.ImageField(upload_to='images/', storage=MediaStorage() if S3_STORAGE else None) 
    document = models.FileField(upload_to='documents/', storage=MediaStorage() if S3_STORAGE else None) 
    

# NDA DOCUMENT


class NDAAgreement(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='nda_agreements')
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    company = models.CharField(max_length=200, blank=True)
    date_signed = models.DateField()
    
    #  Signature as uploaded image (not base64)
    signature = models.FileField(
        upload_to='documents/signatures/',
        blank=False,
        null=False
    )

    ip_address = models.GenericIPAddressField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'NDA Agreement'
        verbose_name_plural = 'NDA Agreements'
        constraints = [
            models.UniqueConstraint(fields=['user'], name='unique_nda_per_user')
        ]

    def __str__(self):
        return f"{self.full_name} - {self.email}"

    def signature_preview(self):
        if self.signature:
            return mark_safe(f'<img src="{self.signature.url}" width="300" height="100" style="border:1px solid #ccc;" />')
        return "(No Signature Uploaded)"
    
    signature_preview.short_description = "Signature Preview"


class InvestorInterest(models.Model):
    CONTACT_METHODS = [
        ("phone", "Phone"),
        ("email", "Email"),
    ]

    investor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="interests")
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="interests")
    contact_method = models.CharField(max_length=10, choices=CONTACT_METHODS)
    confirmed = models.BooleanField(default=False)
    confirmed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("investor", "project")
        verbose_name = "Investor Interest"
        verbose_name_plural = "Investor Interests"

    def __str__(self):
        return f"{self.investor.get_full_name()} interested in {self.project.title}"
