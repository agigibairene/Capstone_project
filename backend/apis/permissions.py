from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.contrib.auth import get_user_model
import logging
from .models import NDAAgreement, UserProfile

logger = logging.getLogger(__name__)
User = get_user_model()


class IsVerifiedFarmer(BasePermission):
    """
    Check if user is a verified farmer who can create projects
    """
    message = "Only verified farmers can perform create a project."
    
    def has_permission(self, request, view):
        
        if not request.user.is_authenticated:
            self.message = "Authentication required."
            logger.warning("User not authenticated")
            return False
        
        # Check if user has profile
        if not hasattr(request.user, 'profile'):
            self.message = "User profile not found. Please complete your profile first."
            logger.warning(f"User {request.user.id} has no profile")
            return False
        
        logger.info(f"User role: {request.user.profile.role}")
        
        # Check if user is a farmer (or allowed roles)
        allowed_roles = ['Farmer', 'Student', 'Entrepreneur']
        if request.user.profile.role not in allowed_roles:
            self.message = f"Only users with roles {', '.join(allowed_roles)} can create projects."
            logger.warning(f"User {request.user.id} has invalid role: {request.user.profile.role}")
            return False
        
        # Check if KYC exists and is verified
        if not hasattr(request.user, 'farmer_kyc'):
            self.message = "KYC verification required. Please complete your KYC submission first."
            logger.warning(f"User {request.user.id} has no farmer_kyc")
            return False
        
        logger.info(f"User KYC verified: {request.user.farmer_kyc.is_verified}")
        
        if not request.user.farmer_kyc.is_verified:
            self.message = "Your KYC is not yet verified. Please wait for admin approval."
            logger.warning(f"User {request.user.id} KYC not verified")
            return False
        
        logger.info(f"User {request.user.id} passed all permission checks")
        return True
    
    
class IsVerifiedInvestor(BasePermission):
    """
    Check if user is a verified investor who can view projects
    """
    message = "Only verified investors can perform this action."
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            self.message = "Authentication required."
            return False
        
        # Check if user has profile
        if not hasattr(request.user, 'profile'):
            self.message = "User profile not found. Please complete your profile first."
            return False
        
        # Check if user is an investor
        if request.user.profile.role != 'Investor':
            self.message = "Only investors can view project details."
            return False
        
        # Check if KYC exists and is verified
        if not hasattr(request.user, 'investor_kyc'):
            self.message = "KYC verification required. Please complete your KYC submission first."
            return False
        
        if not request.user.investor_kyc.is_verified:
            self.message = "Your KYC is not yet verified. Please wait for admin approval."
            return False
        
        return True


class CanViewProject(BasePermission):
    """
    Check if user can view project details based on their role and KYC status.
    Farmers can only view their own projects.
    """
    message = "Permission denied to view project details."
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            self.message = "Authentication required."
            return False
        
        if not hasattr(request.user, 'profile'):
            self.message = "User profile not found. Please complete your profile first."
            return False
        
        user_role = request.user.profile.role

        # Investors can view projects if verified
        if user_role == 'Investor':
            if not hasattr(request.user, 'investor_kyc'):
                self.message = "KYC verification required. Please complete your KYC submission first."
                return False
            
            if not request.user.investor_kyc.is_verified:
                self.message = "Your KYC is not yet verified. Please wait for admin approval."
                return False
            
            return True

        elif user_role in ['Farmer', 'Student', 'Entrepreneur']:
            if request.method in SAFE_METHODS:
                if view.action in ['retrieve', 'download_proposal']:
                    if not hasattr(request.user, 'farmer_kyc'):
                        self.message = "KYC verification required to view detailed project information."
                        return False
                    
                    if not request.user.farmer_kyc.is_verified:
                        self.message = "Your KYC is not yet verified. Please wait for admin approval."
                        return False
                
                return True
            
            return False

        # Admin users can view all projects
        elif request.user.is_staff or request.user.is_superuser:
            return True
        
        self.message = "Invalid user role for this action."
        return False

    def has_object_permission(self, request, view, obj):
        """
        Object-level permission to check if user can view specific project.
        Farmers can only view their own projects.
        """
        if not request.user.is_authenticated:
            return False

        # Admins can view everything
        if request.user.is_staff or request.user.is_superuser:
            return True

        user_role = request.user.profile.role

        # Farmers can only view their own projects
        if user_role in ['Farmer', 'Student', 'Entrepreneur']:
            return obj.farmer == request.user

        if user_role == 'Investor':
            return (hasattr(request.user, 'investor_kyc') and 
                    request.user.investor_kyc.is_verified)

        return False


class IsProjectOwner(BasePermission):
    """Check if user is the owner of the project"""
    message = "You can only modify your own projects."
    
    def has_object_permission(self, request, view, obj):
        return obj.farmer == request.user
    

class HasSubmittedNDA(BasePermission):
    """Custom permission to only allow investors who have submitted NDA to access projects """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            profile = request.user.profile
            if profile.role != 'Investor':
                return True  # Non-investors (farmers, admins) can access without NDA
            
            # For investors, check if they have submitted NDA
            nda_exists = NDAAgreement.objects.filter(user=request.user).exists()
            return nda_exists
            
        except UserProfile.DoesNotExist:
            return False


class CanViewProjectWithNDA(BasePermission):
    """
    Permission for project access: Only investors need NDA, farmers have free access
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            profile = request.user.profile
            
            # Only investors need NDA - everyone else has free access
            if profile.role == 'Investor':
                return NDAAgreement.objects.filter(user=request.user).exists()
            
            return True
            
        except UserProfile.DoesNotExist:
            return False

