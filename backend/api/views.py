from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from .serializers import (
    InvestorSignupSerializer,
    FarmerSignupSerializer,
    CustomTokenObtainPairSerializer,
    UserProfileSerializer
)

class InvestorSignupView(generics.CreateAPIView):
    serializer_class = InvestorSignupSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'status': 'error',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = serializer.save()
            return Response({
                'status': 'success',
                'user_id': user.id,
                'investor_id': user.investor.investor_id
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class FarmerSignupView(generics.CreateAPIView):
    serializer_class = FarmerSignupSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'status': 'error',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = serializer.save()
            return Response({
                'status': 'success',
                'user_id': user.id,
                'farmer_id': user.farmer.farmer_id
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class InvestorDashboard(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not request.user.is_investor:
            return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)
        return Response({
            "message": "Investor Dashboard",
            "user": request.user.username,
            "investor_id": request.user.investor.investor_id
        })

class FarmerDashboard(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not request.user.is_farmer:
            return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)
        return Response({
            "message": "Farmer Dashboard",
            "user": request.user.username,
            "farmer_id": request.user.farmer.farmer_id
        })

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def perform_update(self, serializer):
        user = serializer.save()
        profile_data = self.request.data.get('profile', {})
        
        if user.is_investor and hasattr(user, 'investor'):
            investor = user.investor
            for field, value in profile_data.items():
                setattr(investor, field, value)
            investor.save()
        
        elif user.is_farmer and hasattr(user, 'farmer'):
            farmer = user.farmer
            for field, value in profile_data.items():
                setattr(farmer, field, value)
            farmer.save()