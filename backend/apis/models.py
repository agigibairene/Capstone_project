from django.db import models
from django.contrib.auth.models import User
import uuid

class PasswordReset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reset_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_when = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Password reset for {self.user.username} at {self.created_when}"

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