# permissions.py
from rest_framework import permissions
from django.contrib.auth import get_user_model
from django.http import Http404

import logging

logger = logging.getLogger(__name__)
User = get_user_model()

User = get_user_model()

class IsVerifiedFarmer(permissions.BasePermission):
    """
    Check if user is a verified farmer who can create projects
    """
    message = "Only verified farmers can perform create a project."
    
    def has_permission(self, request, view):
        logger.info(f"IsVerifiedFarmer check for user: {request.user}")
        logger.info(f"User authenticated: {request.user.is_authenticated}")
        
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
    
    
class IsVerifiedInvestor(permissions.BasePermission):
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


class CanViewProject(permissions.BasePermission):
    """
    Check if user can view project details based on their role and KYC status
    """
    message = "Permission denied to view project details."
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            self.message = "Authentication required."
            return False
        
        # Check if user has profile
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
            if request.method in permissions.SAFE_METHODS:
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
        Object-level permission to check if user can view specific project
        """
        if not request.user.is_authenticated:
            return False
        
        # Admin can view all projects
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        # Project owner can always view their own project
        if obj.farmer == request.user:
            return True
        
        # For other users, check role-based permissions
        user_role = request.user.profile.role
        
        # Investors can view projects if verified
        if user_role == 'Investor':
            return (hasattr(request.user, 'investor_kyc') and 
                   request.user.investor_kyc.is_verified)
        
        # Other farmers can view projects if verified
        elif user_role in ['Farmer', 'Student', 'Entrepreneur']:
            return (hasattr(request.user, 'farmer_kyc') and 
                   request.user.farmer_kyc.is_verified)
        
        return False


class IsProjectOwner(permissions.BasePermission):
    """
    Check if user is the owner of the project
    """
    message = "You can only modify your own projects."
    
    def has_object_permission(self, request, view, obj):
        return obj.farmer == request.user