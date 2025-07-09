from django.urls import path

from apis.views import auth_views, kyc_views, opportunities_views, projects_views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('', auth_views.home, name='home'),
    path('auth/signup/', auth_views.signup_view, name='signup'),
    path('auth/login/', auth_views.login_view, name='login'),
    path('auth/logout/', auth_views.logout_view, name='logout'),
    path('auth/forgot-password/', auth_views.forgot_password_view, name='forgot-password'),
    path('auth/reset-password/<str:reset_id>/', auth_views.reset_password_view, name='reset-password'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('auth/token/', TokenObtainPairView.as_view(), name='get_token'),
    path('auth/userprofile/', auth_views.user_profile_view, name='user-profile'),
    path('auth/userprofile/update/', auth_views.update_profile_view, name='update-profile'),
    
    # OTP PATHS
    path("auth/verify-otp/", auth_views.verify_login_otp, name="verify-otp"),
    path("auth/resend-otp/", auth_views.resend_login_otp, name="resend-otp"),
    
    # KYC PATHS
    path('kyc/investor/submit/', kyc_views.submit_investor_kyc, name='submit_investor_kyc'),
    path('kyc/farmer/submit/', kyc_views.submit_farmer_kyc, name='submit_farmer_kyc'),
    path('admin/kyc/pending/', kyc_views.admin_list_pending_kyc, name='admin_list_pending_kyc'),
    path('admin/kyc/verify/<int:user_id>/', kyc_views.admin_verify_kyc, name='admin_verify_kyc'),
    path('kyc/request-change/', kyc_views.request_kyc_change, name='request_kyc_change'),
    path('kyc/user/', kyc_views.get_user_kyc),
    path('kyc/status',kyc_views.get_kyc_status),
    path('kyc/autofill/', kyc_views.kyc_autofill_data, name='kyc-prefill'),

   
    
    # OPPORTUNITIES
    path('opportunities/', opportunities_views.opportunity_list, name='opportunity-list'),
    path('opportunities/<int:pk>/', opportunities_views.opportunity_detail, name='opportunity-detail'),
    path('opportunities/create/', opportunities_views.opportunity_create, name='opportunity-create'),
    path('opportunities/<int:pk>/update/', opportunities_views.opportunity_update, name='opportunity-update'),
    path('opportunities/<int:pk>/delete/', opportunities_views.opportunity_delete, name='opportunity-delete'),
    path('opportunities/stats/', opportunities_views.opportunity_stats, name='opportunity-stats'),
    
    # Project URLs
    path('projects/create/', projects_views.create_project, name='project-create'),
    path('projects/', projects_views.list_projects, name='project-list'),
    path('projects/<uuid:project_id>/', projects_views.project_detail, name='project-detail'),
    path('farmer/projects/', projects_views.farmer_projects, name='farmer-project-list'),
    path('media/proposals/watermarked/<str:filename>', projects_views.serve_watermarked_proposal),
    path('projects/search/', projects_views.search_projects, name='search_projects'),
    path('projects/sum/', projects_views.farmer_projects_sum)

]

