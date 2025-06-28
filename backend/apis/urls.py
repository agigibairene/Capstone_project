from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('forgot-password/', views.forgot_password_view, name='forgot-password'),
    path('reset-password/<str:reset_id>/', views.reset_password_view, name='reset-password'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('token/', TokenObtainPairView.as_view(), name='get_token'),
    path('userprofile/', views.user_profile_view, name='user-profile'),
    path('userprofile/update/', views.update_profile_view, name='update-profile'),
    
    
    path('kyc/investor/submit/', views.submit_investor_kyc, name='submit_investor_kyc'),
    path('kyc/farmer/submit/', views.submit_farmer_kyc, name='submit_farmer_kyc'),
    path('admin/kyc/pending/', views.admin_list_pending_kyc, name='admin_list_pending_kyc'),
    path('admin/kyc/verify/<int:user_id>/', views.admin_verify_kyc, name='admin_verify_kyc'),
    path('kyc/request-change/', views.request_kyc_change, name='request_kyc_change'),
]