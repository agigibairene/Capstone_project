from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

    
urlpatterns = [
    path('signup/investor/', views.InvestorSignupView.as_view(), name='investor-signup'),
    path('signup/farmer/', views.FarmerSignupView.as_view(), name='farmer-signup'),
    path('login/', views.CustomTokenObtainPairView.as_view(), name='login'),
    path('token/', TokenObtainPairView.as_view(), name='get_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh_token')  ,
    path('dashboard/investor/', views.InvestorDashboard.as_view(), name='investor-dashboard'),
    path('dashboard/farmer/', views.FarmerDashboard.as_view(), name='farmer-dashboard'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),

]
