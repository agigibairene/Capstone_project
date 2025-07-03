from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('', views.home, name='home'),
    path('auth/signup/', views.signup_view, name='signup'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/forgot-password/', views.forgot_password_view, name='forgot-password'),
    path('auth/reset-password/<str:reset_id>/', views.reset_password_view, name='reset-password'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('auth/token/', TokenObtainPairView.as_view(), name='get_token'),
    path('auth/userprofile/', views.user_profile_view, name='user-profile'),
    path('auth/userprofile/update/', views.update_profile_view, name='update-profile'),
    
    # KYC PATHS
    path('kyc/investor/submit/', views.submit_investor_kyc, name='submit_investor_kyc'),
    path('kyc/farmer/submit/', views.submit_farmer_kyc, name='submit_farmer_kyc'),
    path('admin/kyc/pending/', views.admin_list_pending_kyc, name='admin_list_pending_kyc'),
    path('admin/kyc/verify/<int:user_id>/', views.admin_verify_kyc, name='admin_verify_kyc'),
    path('kyc/request-change/', views.request_kyc_change, name='request_kyc_change'),
    path('kyc/user/', views.get_user_kyc),
    
    # OTP PATHS
    path("auth/verify-otp/", views.verify_login_otp, name="verify-otp"),
    path("auth/resend-otp/", views.resend_login_otp, name="resend-otp"),
    
    # OPPORTUNITIES
    path('opportunities/', views.opportunity_list, name='opportunity-list'),
    path('opportunities/<int:pk>/', views.opportunity_detail, name='opportunity-detail'),
    path('opportunities/create/', views.opportunity_create, name='opportunity-create'),
    path('opportunities/<int:pk>/update/', views.opportunity_update, name='opportunity-update'),
    path('opportunities/<int:pk>/delete/', views.opportunity_delete, name='opportunity-delete'),
    path('opportunities/stats/', views.opportunity_stats, name='opportunity-stats'),
]