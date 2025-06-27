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
]