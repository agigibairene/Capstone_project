/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface SignupProps {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  role: "Farmer" | "Investor";
  phone_number: string;
  organization?: string;
  investorType?: "Individual" | "Organization";
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: "Farmer" | "Investor";
  phone_number: string;
  organization: string | null;
  investor_type: "Individual" | "Organization" | null;
}

interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

interface AuthState {
  user: User | null;
  access: string | null;
  refresh: string | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: AuthState = {
  user: null,
  access: localStorage.getItem('ACCESS_TOKEN'),
  refresh: localStorage.getItem('REFRESH_TOKEN'),
  loading: false,
  error: null,
  success: false,
};

export const signupUser = createAsyncThunk<AuthResponse, SignupProps, { rejectValue: string }>(
  'auth/signupUser',
  async (signupData, thunkAPI) => {
    try {
      const apiData = {
        first_name: signupData.first_name,
        last_name: signupData.last_name,
        email: signupData.email,
        password: signupData.password,
        confirm_password: signupData.confirm_password,
        role: signupData.role,
        phone_number: signupData.phone_number,
        ...(signupData.organization && { organization: signupData.organization }),
        ...(signupData.investorType && { investor_type: signupData.investorType }),
      };

      console.log('Signup request data:', apiData);

      const response = await fetch('http://127.0.0.1:8000/auth/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();
      console.log('Signup response:', data);

      if (!response.ok) {
        console.log('Error response data:', data);
        
        if (typeof data === 'object' && data !== null) {
          const fieldErrors = data.errors || data;
          const errorMessages = [];
          
          const hasFieldErrors = Object.keys(fieldErrors).some(key => 
            Array.isArray(fieldErrors[key]) || typeof fieldErrors[key] === 'string'
          );
          
          if (hasFieldErrors) {
            for (const [field, messages] of Object.entries(fieldErrors)) {
              if (Array.isArray(messages) && messages.length > 0) {
                const processedMessages = messages.map(msg => {
                  if (field === 'email' && msg.toLowerCase().includes('email already exists')) {
                    return 'This email is already registered';
                  }
                  if (field === 'phone_number' && msg.toLowerCase().includes('phone')) {
                    return msg.replace(/phone\s+number\s+/i, '').replace(/phone\s+/i, '');
                  }
                  const fieldWords = field.toLowerCase().split('_');
                  let cleanMsg = msg;
                  fieldWords.forEach(word => {
                    const regex = new RegExp(`^${word}\\s+`, 'i');
                    cleanMsg = cleanMsg.replace(regex, '');
                  });
                  return cleanMsg;
                });
                
                errorMessages.push(...processedMessages);
              } else if (typeof messages === 'string') {
                let cleanMsg = messages;
                
                if (field === 'email' && messages.toLowerCase().includes('email already exists')) {
                  cleanMsg = 'This email is already registered';
                } else if (field === 'phone_number' && messages.toLowerCase().includes('phone')) {
                  cleanMsg = messages.replace(/phone\s+number\s+/i, '').replace(/phone\s+/i, '');
                } else {
                  const fieldWords = field.toLowerCase().split('_');
                  fieldWords.forEach(word => {
                    const regex = new RegExp(`^${word}\\s+`, 'i');
                    cleanMsg = cleanMsg.replace(regex, '');
                  });
                }
                
                errorMessages.push(cleanMsg);
              }
            }
            
            if (errorMessages.length > 0) {
              return thunkAPI.rejectWithValue(errorMessages.join('. '));
            }
          }
        }
        
        const errorMsg = data.detail || data.message || 'Signup failed. Please try again.';
        return thunkAPI.rejectWithValue(errorMsg);
      }

      const { user, access, refresh } = data;

      const userRole = user?.role || signupData.role;
      console.log('User role from response:', user?.role);
      console.log('User role from signup data:', signupData.role);
      console.log('Final role to store:', userRole);

      localStorage.setItem('ACCESS_TOKEN', access);
      localStorage.setItem('REFRESH_TOKEN', refresh);
      localStorage.setItem('role', userRole);
      console.log('Signup successful, role stored:', userRole);

      const correctedUser = {
        ...user,
        role: userRole
      };

      return { user: correctedUser, access, refresh };
    } catch (error: any) {
      console.error('Signup error:', error);
      return thunkAPI.rejectWithValue(error.message || 'Network error. Please check your connection.');
    }
  }
);


const signupSlice = createSlice({
  name: 'signup',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.access = null;
      state.refresh = null;
      state.success = false;
      localStorage.removeItem('ACCESS_TOKEN');
      localStorage.removeItem('REFRESH_TOKEN');
      localStorage.removeItem('role');
    },
    resetSignupState(state) {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearError(state) {
      state.error = null;
    },
    setUserRole(state, action) {
      if (state.user) {
        state.user.role = action.payload;
        localStorage.setItem('role', action.payload);
      }
    },
    initializeAuth(state) {
      const token = localStorage.getItem('ACCESS_TOKEN');
      const role = localStorage.getItem('role');
      
      console.log('Initializing auth:', { token: !!token, role });
      
      if (token && role && role !== 'undefined') {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (payload.exp && payload.exp > currentTime) {
            state.user = {
              id: payload.user_id || 0,
              first_name: payload.first_name || '',
              last_name: payload.last_name || '',
              email: payload.email || '',
              role: role as "Farmer" | "Investor",
              phone_number: payload.phone_number || '',
              organization: payload.organization || null,
              investor_type: payload.investor_type || null,
            };
            state.access = token;
            state.refresh = localStorage.getItem('REFRESH_TOKEN');
            console.log('Auth initialized from storage:', state.user);
          } else {
            console.log('Token expired, clearing storage');
            localStorage.removeItem('ACCESS_TOKEN');
            localStorage.removeItem('REFRESH_TOKEN');
            localStorage.removeItem('role');
          }
        } catch (error) {
          console.error('Failed to parse token:', error);
          localStorage.removeItem('ACCESS_TOKEN');
          localStorage.removeItem('REFRESH_TOKEN');
          localStorage.removeItem('role');
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.access = action.payload.access;
        state.refresh = action.payload.refresh;
        state.success = true;
        state.error = null;
        const role = action.payload.user.role;
        localStorage.setItem('role', role);
        console.log('Signup fulfilled, role set:', role);
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Signup failed';
        state.success = false;
      });
  },
});

export const { logout, resetSignupState, clearError, setUserRole, initializeAuth } = signupSlice.actions;
export const signupReducer = signupSlice.reducer;