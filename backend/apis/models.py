from datetime import timedelta, timezone
from django.db import models
from django.contrib.auth.models import User
import uuid
from django.core.validators import MinValueValidator
from django.forms import ValidationError

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
    
    id_type = models.CharField(max_length=20, choices=ID_TYPE_CHOICES)
    id_number = models.CharField(max_length=100)
    id_document = models.FileField(upload_to='kyc/documents/id/', null=True, blank=True)
    profile_picture = models.ImageField(upload_to='kyc/profiles/', null=True, blank=True)
    
    address = models.TextField()
    occupation = models.CharField(max_length=200)
    income_source = models.CharField(max_length=20, choices=INCOME_SOURCE_CHOICES)
    annual_income = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    purpose = models.TextField(help_text="Purpose of the investment account")
    
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, help_text="Admin notes for verification")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        """Override save to prevent updates after creation"""
        if self.pk is not None:  # This is an update
            # Only allow admin fields to be updated
            original = InvestorKYC.objects.get(pk=self.pk)
            
            # List of fields that can be updated (admin-only fields)
            admin_updatable_fields = ['is_verified', 'verification_date', 'notes']
            
            # Check if any non-admin fields are being changed
            for field in self._meta.fields:
                if field.name not in admin_updatable_fields and field.name not in ['updated_at']:
                    old_value = getattr(original, field.name)
                    new_value = getattr(self, field.name)
                    if old_value != new_value:
                        raise ValidationError(f"KYC data is immutable. Cannot update field: {field.name}")
        
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
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='farmer_kyc')
    
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    background = models.TextField(help_text="Brief background information")
    
    project_title = models.CharField(max_length=255)
    project_description = models.TextField()
    estimated_budget = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    funding_needed = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    location = models.CharField(max_length=255)
    project_document = models.FileField(upload_to='kyc/documents/projects/', null=True, blank=True)
    
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, help_text="Admin notes for verification")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        """Override save to prevent updates after creation"""
        if self.pk is not None:  
            original = FarmerKYC.objects.get(pk=self.pk)
            
            admin_updatable_fields = ['is_verified', 'verification_date', 'notes']
            
            for field in self._meta.fields:
                if field.name not in admin_updatable_fields and field.name not in ['updated_at']:
                    old_value = getattr(original, field.name)
                    new_value = getattr(self, field.name)
                    if old_value != new_value:
                        raise ValidationError(f"KYC data is immutable. Cannot update field: {field.name}")
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"KYC for {self.full_name} - {self.project_title}"

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
    notes = models.TextField(blank=True)
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