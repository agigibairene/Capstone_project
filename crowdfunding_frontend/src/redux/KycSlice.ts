/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface KYCState {
  loading: boolean;
  error: string | null;
  success: boolean;
  kycData: any | null;
  role: string | null;
}

const initialState: KYCState = {
  loading: false,
  error: null,
  success: false,
  kycData: null,
  role: null,
};

export const investorKYC = createAsyncThunk(
  'kyc/investor',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('ACCESS_TOKEN');
     
      if (!token) {
        return rejectWithValue('No authentication token found. Please login again.');
      }

      console.log('Submitting KYC with token:', token.substring(0, 20) + '...');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/kyc/investor/submit/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('KYC Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('ACCESS_TOKEN');
          localStorage.removeItem('REFRESH_TOKEN');
          localStorage.removeItem('role');
          return rejectWithValue('Session expired. Please login again.');
        }
       
        const errorData = await response.json();
        console.error('KYC Error response:', errorData);
        return rejectWithValue(
          errorData.message || 
          errorData.detail || 
          JSON.stringify(errorData.errors) || 
          'KYC submission failed'
        );
      }

      const data = await response.json();
      console.log('KYC Success response:', data);
      
      // Ensure role is maintained after successful KYC
      const storedRole = localStorage.getItem('role');
      if (!storedRole || storedRole === 'undefined') {
        // Try to get role from token
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.role && payload.role !== 'undefined') {
            localStorage.setItem('role', payload.role);
            console.log('Role restored from token after KYC:', payload.role);
          }
        } catch (e) {
          console.error('Failed to restore role from token:', e);
        }
      }

      return data;
    } catch (error: any) {
      console.error('KYC Submission error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return rejectWithValue('Network error. Please check your connection.');
      }
      return rejectWithValue(error.message || 'An unexpected error occurred');
    }
  }
);

export const submitFarmerKYC = createAsyncThunk(
  'kyc/farmer',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('ACCESS_TOKEN');
     
      if (!token) {
        return rejectWithValue('No authentication token found. Please login again.');
      }

      console.log('Submitting Farmer KYC with token:', token.substring(0, 20) + '...');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/kyc/farmer/submit/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Farmer KYC Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('ACCESS_TOKEN');
          localStorage.removeItem('REFRESH_TOKEN');
          localStorage.removeItem('role');
          return rejectWithValue('Session expired. Please login again.');
        }
       
        const errorData = await response.json();
        console.error('Farmer KYC Error response:', errorData);
        return rejectWithValue(
          errorData.message || 
          errorData.detail || 
          JSON.stringify(errorData.errors) || 
          'Farmer KYC submission failed'
        );
      }

      const data = await response.json();
      console.log('Farmer KYC Success response:', data);
      
      // Ensure role is maintained after successful KYC
      const storedRole = localStorage.getItem('role');
      if (!storedRole || storedRole === 'undefined') {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.role && payload.role !== 'undefined') {
            localStorage.setItem('role', payload.role);
            console.log('Role restored from token after Farmer KYC:', payload.role);
          }
        } catch (e) {
          console.error('Failed to restore role from token:', e);
        }
      }

      return data;
    } catch (error: any) {
      console.error('Farmer KYC Submission error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return rejectWithValue('Network error. Please check your connection.');
      }
      return rejectWithValue(error.message || 'An unexpected error occurred');
    }
  }
);

export const fetchUserKYC = createAsyncThunk(
  'kyc/fetchUserKYC',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('ACCESS_TOKEN');
      if (!token) {
        return rejectWithValue('No access token found. Please login again.');
      }

      console.log('Fetching KYC data...');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/kyc/user/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('ACCESS_TOKEN');
          localStorage.removeItem('REFRESH_TOKEN');
          localStorage.removeItem('role');
          return rejectWithValue('Session expired. Please login again.');
        }
        
        const errorData = await response.json();
        console.error('KYC fetch error:', errorData);
        return rejectWithValue(errorData.message || `HTTP ${response.status}: Failed to fetch KYC data`);
      }

      const data = await response.json();
      console.log('KYC fetch success:', data);
      
      // Validate the response structure
      if (!data.success) {
        return rejectWithValue(data.message || 'KYC fetch was not successful');
      }

      if (!data.kyc) {
        return rejectWithValue('No KYC data found for your account');
      }

      return data; // Return the full response object
      
    } catch (err: any) {
      console.error('KYC fetch error:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        return rejectWithValue('Network error. Please check your internet connection.');
      }
      return rejectWithValue(err.message || 'An unexpected error occurred while fetching KYC data');
    }
  }
);


const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    resetKYCState(state) {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearKYCError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Investor KYC cases
      .addCase(investorKYC.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        console.log('Investor KYC pending...');
      })
      .addCase(investorKYC.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        console.log('Investor KYC fulfilled successfully');
      })
      .addCase(investorKYC.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' 
          ? action.payload 
          : 'KYC submission failed';
        state.success = false;
        console.log('Investor KYC rejected:', state.error);
      })
      
      // Farmer KYC cases
      .addCase(submitFarmerKYC.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        console.log('Farmer KYC pending...');
      })
      .addCase(submitFarmerKYC.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        console.log('Farmer KYC fulfilled successfully');
      })
      .addCase(submitFarmerKYC.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' 
          ? action.payload 
          : 'Farmer KYC submission failed';
        state.success = false;
        console.log('Farmer KYC rejected:', state.error);
      })

      // GET USER
.addCase(fetchUserKYC.pending, (state) => {
  state.loading = true;
  state.error = null;
  console.log('Fetching KYC data...');
})
.addCase(fetchUserKYC.fulfilled, (state, action) => {
  state.loading = false;
  state.success = action.payload.success;
  state.kycData = action.payload; 
  state.role = action.payload.role;
  state.error = null;
  console.log('KYC data fetched successfully:', action.payload);
})
.addCase(fetchUserKYC.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload as string;
  state.kycData = null;
  state.success = false;
  console.error('KYC fetch failed:', action.payload);
});
  },
});

export const { resetKYCState, clearKYCError } = kycSlice.actions;
export const kycReducer = kycSlice.reducer;