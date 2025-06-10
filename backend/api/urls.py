from django.urls import path
from . import views

    
urlpatterns = [
    path('signup/investor/', views.InvestorSignupView.as_view(), name='investor-signup'),
]
