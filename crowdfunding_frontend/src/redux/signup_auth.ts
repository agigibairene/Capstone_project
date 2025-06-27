/* eslint-disable @typescript-eslint/no-unused-vars */
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
  investorType: "Individual" | "Organization" | null;
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
  access: localStorage.getItem('access'),
  refresh: localStorage.getItem('refresh'),
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

      const response = await fetch('http://127.0.0.1:8000/auth/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();

      if (!response.ok) {
        const errors = data.errors;
        if (errors?.email?.length > 0) {
          return thunkAPI.rejectWithValue(errors.email[0]); 
        }
        if (errors?.confirm_password?.length > 0) {
          return thunkAPI.rejectWithValue(errors.confirm_password[0]);
        }
        if (errors?.password?.length > 0) {
          return thunkAPI.rejectWithValue(errors.password[0]);
        }
        return thunkAPI.rejectWithValue(data.detail || data.message || 'Signup failed');
      }

      const { user, access, refresh } = data;
      localStorage.setItem('ACCESS_TOKEN', access);
      localStorage.setItem('REFRESH_TOKEN', refresh);

      return { user, access, refresh };
    } catch (error) {
      return thunkAPI.rejectWithValue('Failed to signup');
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
    },
    resetSignupState(state) {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signupUser.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(signupUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.access = action.payload.access;
      state.refresh = action.payload.refresh;
      state.success = true;
      state.error = null;
    });
    builder.addCase(signupUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Signup failed';
      state.success = false;
    });
  },
});

export const { logout, resetSignupState, clearError } = signupSlice.actions;
export const signupReducer = signupSlice.reducer;