from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Opportunity

@shared_task
def cleanup_expired_opportunities():
    """
    Deactivate opportunities that are 1 day past their deadline
    """
    cutoff_date = timezone.now().date() - timedelta(days=1)
    
    expired_opportunities = Opportunity.objects.filter(
        deadline__lt=cutoff_date,
        is_active=True
    )
    
    count = expired_opportunities.count()
    expired_opportunities.update(is_active=False)
    
    return f"Deactivated {count} expired opportunities"

@shared_task
def schedule_opportunity_cleanup(opportunity_id):
    """
    Schedule cleanup for a specific opportunity
    """
    try:
        opportunity = Opportunity.objects.get(id=opportunity_id)
        cleanup_date = opportunity.deadline + timedelta(days=1)
        
        # Schedule the cleanup task
        cleanup_single_opportunity.apply_async(
            args=[opportunity_id],
            eta=timezone.make_aware(
                timezone.datetime.combine(cleanup_date, timezone.datetime.min.time())
            )
        )
        
        return f"Scheduled cleanup for opportunity {opportunity.title}"
    except Opportunity.DoesNotExist:
        return f"Opportunity {opportunity_id} not found"

@shared_task
def cleanup_single_opportunity(opportunity_id):
    """
    Cleanup a single opportunity
    """
    try:
        opportunity = Opportunity.objects.get(id=opportunity_id, is_active=True)
        opportunity.is_active = False
        opportunity.save()
        return f"Deactivated opportunity: {opportunity.title}"
    except Opportunity.DoesNotExist:
        return f"Opportunity {opportunity_id} not found or already inactive"