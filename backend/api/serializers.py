from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Investor, Farmer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError({'password': e.messages})
        return value

class InvestorSignupSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    investor_id = serializers.CharField(max_length=20, required=True)

    class Meta:
        model = Investor
        fields = ['user', 'investor_id']

    def validate(self, attrs):
        user_data = attrs['user']
        
        # Check username uniqueness
        if User.objects.filter(username=user_data['username']).exists():
            raise serializers.ValidationError(
                {'user': {'username': ['This username is already taken.']}}
            )
            
        # Check email uniqueness
        if User.objects.filter(email=user_data['email']).exists():
            raise serializers.ValidationError(
                {'user': {'email': ['This email is already registered.']}}
            )
            
        # Check investor_id uniqueness
        if Investor.objects.filter(investor_id=attrs['investor_id']).exists():
            raise serializers.ValidationError(
                {'investor_id': ['This investor ID is already in use.']}
            )
            
        return attrs

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        
        try:
            user = User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password'],
                first_name=user_data.get('first_name', ''),
                last_name=user_data.get('last_name', ''),
                is_investor=True
            )
            
            investor = Investor.objects.create(
                user=user,
                investor_id=validated_data['investor_id']
            )
            
            return user
            
        except Exception as e:
            if 'user' in locals():
                user.delete()
            raise serializers.ValidationError(str(e))

class FarmerSignupSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    farmer_id = serializers.CharField(max_length=20, required=True)

    class Meta:
        model = Farmer
        fields = ['user', 'farmer_id']

    def validate(self, attrs):
        user_data = attrs['user']
        
        if User.objects.filter(username=user_data['username']).exists():
            raise serializers.ValidationError(
                {'user': {'username': ['This username is already taken.']}}
            )
            
        if User.objects.filter(email=user_data['email']).exists():
            raise serializers.ValidationError(
                {'user': {'email': ['This email is already registered.']}}
            )
            
        if Farmer.objects.filter(farmer_id=attrs['farmer_id']).exists():
            raise serializers.ValidationError(
                {'farmer_id': ['This farmer ID is already in use.']}
            )
            
        return attrs

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        
        try:
            user = User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password'],
                first_name=user_data.get('first_name', ''),
                last_name=user_data.get('last_name', ''),
                is_farmer=True
            )
            
            farmer = Farmer.objects.create(
                user=user,
                farmer_id=validated_data['farmer_id']
            )
            
            return user
            
        except Exception as e:
            if 'user' in locals():
                user.delete()
            raise serializers.ValidationError(str(e))

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        refresh = self.get_token(self.user)
        data.update({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user_type': 'investor' if self.user.is_investor else 'farmer',
            'username': self.user.username,
            'email': self.user.email,
            'user_id': self.user.id
        })
        return data

class BaseProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        abstract = True
        fields = ['username', 'email', 'first_name', 'last_name']

class InvestorProfileSerializer(BaseProfileSerializer):
    class Meta(BaseProfileSerializer.Meta):
        model = Investor
        fields = BaseProfileSerializer.Meta.fields + ['investor_id', 'phone', 'organization']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance

class FarmerProfileSerializer(BaseProfileSerializer):
    class Meta(BaseProfileSerializer.Meta):
        model = Farmer
        fields = BaseProfileSerializer.Meta.fields + ['farmer_id', 'location', 'crops']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance

class UserProfileSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']
        read_only_fields = ['id', 'username', 'email']

    def get_profile(self, obj):
        if hasattr(obj, 'investor'):
            return InvestorProfileSerializer(obj.investor).data
        elif hasattr(obj, 'farmer'):
            return FarmerProfileSerializer(obj.farmer).data
        return None