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
  profile: UserProfile;
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
  refresh: localStorage.getItem('REFRESH_TOKEN'),
  access: localStorage.getItem('ACCESS_TOKEN'), 
  loading: false,
  error: null
}

const ACCESS_TOKEN = 'ACCESS_TOKEN';
const REFRESH_TOKEN = 'REFRESH_TOKEN';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: Props, thunkAPI) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login/`, {
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

      if (data.requires_otp) {
        return { 
          requires_otp: true, 
          username: data.username,
          success: true 
        };
      } else {
        const { access, refresh, user } = data;
        
        // Store tokens with consistent keys
        localStorage.setItem(ACCESS_TOKEN, access);
        localStorage.setItem(REFRESH_TOKEN, refresh);
        localStorage.setItem('role', user.profile.role);

        return { user, access, refresh, success: true };
      }
    } 
    catch (error) {
      console.error('Login error:', error);
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
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
      localStorage.removeItem('role');
    },
    setAuthTokens(state, action) {
      const { user, access, refresh } = action.payload;
      state.user = user;
      state.access = access;
      state.refresh = refresh;
      localStorage.setItem(ACCESS_TOKEN, access);
      localStorage.setItem(REFRESH_TOKEN, refresh);
      localStorage.setItem('role', user.profile.role);
    },
    initializeAuth(state) {
      const token = localStorage.getItem(ACCESS_TOKEN);
      const role = localStorage.getItem('role');
      
      
      if (token && role && role !== 'undefined') {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (payload.exp && payload.exp > currentTime) {
            state.user = {
              id: payload.user_id || 0,
              username: payload.username || payload.email || '',
              email: payload.email || '',
              first_name: payload.first_name || '',
              last_name: payload.last_name || '',
              date_joined: payload.date_joined || '',
              profile: {
                phone_number: payload.phone_number || '',
                role: role as "Farmer" | "Investor",
                organization: payload.organization || '',
                investor_type: payload.investor_type || null,
              }
            };
            state.access = token;
            state.refresh = localStorage.getItem(REFRESH_TOKEN);
          } else {
            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(REFRESH_TOKEN);
            localStorage.removeItem('role');
          }
        } catch (error) {
          console.error('Login slice - Failed to parse token:', error);
          localStorage.removeItem(ACCESS_TOKEN);
          localStorage.removeItem(REFRESH_TOKEN);
          localStorage.removeItem('role');
        }
      }
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
        if (!action.payload.requires_otp) {
          state.user = action.payload.user;
          state.access = action.payload.access;
          state.refresh = action.payload.refresh;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | number | string;
      });
  },
});

export const { logout, setAuthTokens, initializeAuth } = loginSlice.actions;
export const loginReducer = loginSlice.reducer;