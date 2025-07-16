from atexit import register
from datetime import timezone
from re import I
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import NDAAgreement, Project, UserProfile, PasswordReset, KYCVerificationLog, FarmerKYC,InvestorKYC, Opportunity
from django.utils.html import format_html


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fields = ('role', 'phone_number', 'organization', 'investor_type')

class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_role', 'is_staff', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined', 'profile__role')
    search_fields = ('username', 'first_name', 'last_name', 'email', 'profile__phone_number')
    
    def get_role(self, obj):
        try:
            return obj.profile.role
        except UserProfile.DoesNotExist:
            return 'No Profile'
    get_role.short_description = 'Role'
    get_role.admin_order_field = 'profile__role'

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'phone_number', 'organization', 'investor_type', 'created_at')
    list_filter = ('role', 'investor_type', 'created_at')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name', 'phone_number', 'organization')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Profile Details', {
            'fields': ('role', 'phone_number', 'organization', 'investor_type')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PasswordReset)
class PasswordResetAdmin(admin.ModelAdmin):
    list_display = ('user', 'reset_id', 'created_when', 'is_expired')
    list_filter = ('created_when',)
    search_fields = ('user__username', 'user__email', 'reset_id')
    readonly_fields = ('reset_id', 'created_when')
    
    def is_expired(self, obj):
        from django.utils import timezone
        import datetime
        expiration_time = obj.created_when + datetime.timedelta(minutes=10)
        return timezone.now() > expiration_time
    is_expired.boolean = True
    is_expired.short_description = 'Expired'

admin.site.unregister(User)
admin.site.register(User, UserAdmin)
admin.site.register(KYCVerificationLog)
admin.site.register(InvestorKYC)
admin.site.register(FarmerKYC)


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ['title', 'organization', 'type', 'deadline', 'views', 'applicants', 'is_active', 'posted']
    list_filter = ['type', 'is_active', 'posted', 'deadline']
    search_fields = ['title', 'organization', 'description']
    readonly_fields = ['views', 'posted', 'created_by']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'organization', 'location', 'theme') 
        }),
        ('Opportunity Details', {
            'fields': ('type', 'tags', 'description', 'full_description', 'amount', 'deadline', 'application_link')
        }),
        ('Statistics', {
            'fields': ('views', 'applicants'),
            'classes': ('collapse',)
        }),
        ('Meta', {
            'fields': ('is_active', 'posted', 'created_by'),
            'classes': ('collapse',)
        })
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  
            obj.created_by = request.user
        super().save_model(request, obj, form, change)



@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'farmer', 'status', 'target_amount', 'deadline', 'created_at')
    list_filter = ('status', 'created_at', 'deadline')
    search_fields = ('title', 'farmer__username', 'email', 'brief', 'description')
    readonly_fields = ('watermarked_proposal', 'created_at', 'updated_at')
    
    # def status_display(self, obj):
    #     return obj.get_status_display()
    # status_display.short_description = 'Status'

    def watermarked_link(self, obj):
        if obj.watermarked_proposal:
            return format_html("<a href='{}'>Download</a>", obj.watermarked_proposal.url)
        return "No file"
    
    watermarked_link.short_description = "Watermarked Proposal" 
    
    fieldsets = (
        (None, {
            'fields': ('farmer', 'name', 'title', 'email', 'brief', 'description', 'benefits')
        }),
        ('Funding Info', {
            'fields': ('target_amount', 'deadline')
        }),
        ('Media & Files', {
            'fields': ('image_url', 'original_proposal', 'watermarked_proposal')
        }),
        ('Status & Timestamps', {
            'fields': ('status', 'created_at', 'updated_at')
        }),
    )
    
    # def save_model(self, request, obj, form, change):
    #     if not obj.status:
    #         obj.status = 'pending'
    #     super().save_model(request, obj, form, change)


# NDA

@admin.register(NDAAgreement)
class NDAAgreementAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'company', 'date_signed', 'ip_address', 'submitted_at')
    readonly_fields = ('signature_preview', 'signature', 'submitted_at')  
    search_fields = ('full_name', 'email', 'company')
    list_filter = ('date_signed', 'submitted_at')
    ordering = ('-submitted_at',)
    fieldsets = (
        ('Submitted Info', {
            'fields': ('user', 'full_name', 'email', 'company', 'date_signed', 'ip_address', 'submitted_at')
        }),
        ('Signature', {
            'fields': ('signature_preview',)
        }),
    )

    
