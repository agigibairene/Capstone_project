from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import UserProfile
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create user profile when user is created"""
    if created and not instance.is_superuser:
        try:
            with transaction.atomic():
                if not instance.is_active:
                    instance.is_active = True
                    instance.save(update_fields=['is_active'])
                
                profile, profile_created = UserProfile.objects.get_or_create(
                    user=instance,
                    defaults={
                        'phone_number': '',
                        'role': 'Farmer',  
                        'organization': '',
                        'investor_type': ''
                    }
                )
                
                if profile_created:
                    logger.info(f"Profile created for user: {instance.username}")
                else:
                    logger.info(f"Profile already exists for user: {instance.username}")
                    
        except Exception as e:
            logger.error(f"Error creating profile for user {instance.username}: {str(e)}")


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save user profile when user is saved"""
    try:
        if hasattr(instance, 'profile') and instance.profile:
            instance.profile.save()
    except Exception as e:
        logger.error(f"Error saving profile for user {instance.username}: {str(e)}")