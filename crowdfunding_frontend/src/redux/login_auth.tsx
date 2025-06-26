// Updated Redux Types and Logic
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Props {
  email: string;
  password: string;
}

interface UserProfile {
  phone_number: string;
  role: "Farmer" | "Investor";
  organization: string;
  investor_type: "Individual" | "Organization" | null;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  profile: UserProfile; // Changed from userprofile to profile to match backend
}

interface AuthProps {
  user: User | null;
  access: string | null;
  refresh: string | null;
  loading: boolean;
  error: null | number | string;
}

const initialState: AuthProps = {
  user: null,
  access: null,
  refresh: null,
  loading: false,
  error: null
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: Props, thunkAPI) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return thunkAPI.rejectWithValue(data.errors?.general || data.detail || 'Login failed');
      }

      const { access, refresh, user } = data;

      localStorage.setItem('ACCESS_TOKEN', access);
      localStorage.setItem('REFRESH_TOKEN', refresh);

      return { user, access, refresh };
    } 
    catch (error) {
      return thunkAPI.rejectWithValue('Failed to login');
    }
  }
);

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.access = null;
      state.refresh = null;
      localStorage.removeItem('ACCESS_TOKEN');
      localStorage.removeItem('REFRESH_TOKEN');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.access = action.payload.access;
        state.refresh = action.payload.refresh;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | number | null;
      });
  },
});

export const { logout } = loginSlice.actions;
export const loginReducer = loginSlice.reducer;