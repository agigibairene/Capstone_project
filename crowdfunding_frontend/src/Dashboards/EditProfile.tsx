/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Edit, Check, X, User } from 'lucide-react';
import { API_URL } from '../Utils/constants';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  profile?: {
    address: string;
    phone_number: string;
    organization: string;
    investor_type: string;
  };
}

export default function EditProfile() {
  const [profileData, setProfileData] = useState<Profile>({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { kycData } = useSelector((state: RootState)=>state.kycReducer);
  console.log(kycData.kyc)
  // USER TOKEN
  const token = localStorage.getItem('ACCESS_TOKEN');

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/auth/profile/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data.data);
        console.log(data);
      } else {
        console.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (field: string, value: string) => {
  try {
    setIsLoading(true);
    const payload = {
      [field]: value
    };
    
    const response = await fetch(`${API_URL}/auth/profile-update/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text(); // First get as text to see what's coming
      try {
        // Try to parse as JSON if possible
        const jsonError = JSON.parse(errorData);
        throw new Error(jsonError.error || jsonError.message || 'Update failed');
      } catch {
        throw new Error(errorData || 'Update failed');
      }
    }

    const data = await response.json();
    console.log('Profile updated successfully:', data);
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    // You might want to show this error to the user
    return false;
  } finally {
    setIsLoading(false);
  }
  };

  const handleSave = async (field: string) => {
    const success = await updateProfile(field, tempValue);
    if (success) {
      setProfileData(prev => ({
        ...prev,
        [field]: tempValue
      }));
      setEditingField(null);
      setTempValue('');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
  };


  const handleCancel = () => {
    setEditingField(null);
    setTempValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, field: string) => {
    if (e.key === 'Enter') {
      handleSave(field);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const ProfileField = ({ label, field, value }: { label: string; field: string; value: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100">
      <span className="text-white font-medium">{label}</span>
      <div className="flex items-center space-x-2">
        {editingField === field ? (
          <div className="flex items-center space-x-2">
            <input
              type={field === 'email' ? 'email' : 'text'}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, field)}
              className="px-2 py-1 border border-gray-300 text-limeTxt rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              disabled={isLoading}
            />
            <button
              onClick={() => handleSave(field)}
              className="p-1 text-limeTxt hover:text-green-400 cursor-pointer disabled:opacity-50"
              disabled={isLoading}
            >
              <Check className="w-6 h-6" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-red-600 cursor-pointer hover:text-red-700"
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <>
            <span className="text-limeTxt">{value || 'Not set'}</span>
            <button
              onClick={() => handleEdit(field, value)}
              className="p-1 text-white cursor-pointer hover:text-gray-300"
              disabled={isLoading}
            >
              <Edit className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );

  if (isLoading && !profileData.first_name) {
    return (
      <div className="min-h-screen bg-white/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-4 md:pt-0">
      {/* Profile Image and Name */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
          {
            kycData.kyc.profile_picture ? <img src={kycData.kyc.profile_picture} alt="" /> :
            <User/>
          }
        </div>
        <div className="mb-1">
          <div className="flex items-center justify-center space-x-2">
            <h2 className="text-xl font-semibold text-limeTxt">
              {profileData.first_name} {profileData.last_name}
            </h2>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="space-y-4">
        <ProfileField 
          label="First Name" 
          field="first_name" 
          value={profileData.first_name} 
        />
        <ProfileField 
          label="Last Name" 
          field="last_name" 
          value={profileData.last_name} 
        />
        <ProfileField 
          label="Email" 
          field="email" 
          value={profileData.email} 
        />
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}

