from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    is_investor = models.BooleanField(default=False)
    is_farmer = models.BooleanField(default=False)

    @property
    def profile(self):
        """Get the associated profile based on user type"""
        if hasattr(self, 'investor'):
            return self.investor
        elif hasattr(self, 'farmer'):
            return self.farmer
        return None

class Investor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='investor')
    investor_id = models.CharField(max_length=20, unique=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True)



class Farmer(models.Model):  
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='farmer')
    farmer_id = models.CharField(max_length=20, unique=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True)

