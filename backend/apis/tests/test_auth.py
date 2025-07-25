import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()

import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from unittest.mock import PropertyMock, patch, MagicMock
from rest_framework import status
from apis.models import UserProfile

@pytest.mark.django_db
class TestSignupView:

    @pytest.fixture(autouse=True)
    def setup(self):
        self.client = APIClient()
        self.url = reverse('signup')  

    @patch('apis.views.auth_views.UserSignUpSerializer')
    @patch('apis.views.auth_views.transaction.atomic')
    @patch('apis.views.auth_views.RefreshToken')
    @patch('apis.views.auth_views.UserSerializer')
    @patch('apis.views.auth_views.UserProfile.objects.create')
    def test_signup_success(
        self,
        mock_profile_create,
        mock_user_serializer,
        mock_refresh_token,
        mock_transaction_atomic,
        mock_signup_serializer
    ):
        # Setup mock serializer to be valid
        mock_serializer_instance = MagicMock()
        mock_serializer_instance.is_valid.return_value = True
        mock_user = MagicMock()
        mock_serializer_instance.save.return_value = mock_user
        mock_signup_serializer.return_value = mock_serializer_instance

        # Mock user.profile access to raise DoesNotExist so profile is created
        type(mock_user).profile = PropertyMock(side_effect=UserProfile.DoesNotExist)

        # Setup mock profile creation return
        mock_profile_create.return_value = MagicMock()

        # Mock RefreshToken for user
        mock_refresh = MagicMock()
        mock_refresh.access_token = 'access_token'
        mock_refresh_token.for_user.return_value = mock_refresh
        mock_refresh.__str__.return_value = 'refresh_token'

        # Mock UserSerializer to return data
        mock_user_serializer.return_value.data = {'email': 'test@example.com'}

        post_data = {
            'email': 'test@example.com',
            'password': 'testpassword',
            'phone_number': '123456789',
            'role': 'Farmer',
            'organization': 'TestOrg',
            'investor_type': ''
        }

        response = self.client.post(self.url, data=post_data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['success'] is True
        assert 'user' in response.data
        assert response.data['access'] == 'access_token'
        assert response.data['refresh'] == 'refresh_token'
        mock_serializer_instance.is_valid.assert_called_once()
        mock_serializer_instance.save.assert_called_once()
        mock_profile_create.assert_called_once_with(
            user=mock_user,
            phone_number=post_data['phone_number'],
            role=post_data['role'],
            organization=post_data['organization'],
            investor_type=post_data['investor_type'],
        )

    def test_signup_invalid_data(self):
        post_data = {
            'email': '',
            'password': '',
        }
        response = self.client.post(self.url, data=post_data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['success'] is False
        assert 'errors' in response.data

    @patch('apis.views.auth_views.UserSignUpSerializer')
    def test_signup_serializer_exception(self, mock_signup_serializer):
        mock_serializer_instance = MagicMock()
        mock_serializer_instance.is_valid.side_effect = Exception("Serializer failure")
        mock_signup_serializer.return_value = mock_serializer_instance

        post_data = {
            'email': 'test@example.com',
            'password': 'testpassword',
        }
        response = self.client.post(self.url, data=post_data, format='json')
        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert response.data['success'] is False
        assert 'general' in response.data['errors']
