import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface Props {
  email: string;
  password: string;
}

interface VerifyOTPProps {
  username: string;
  otp_code: string;
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
  date_joined?: string;
  profile: UserProfile;
}

interface AuthProps {
  user: User | null;
  access: string | null;
  loading: boolean;
  error: string | null;
}

const API_URL = import.meta.env.VITE_API_URL;

const initialState: AuthProps = {
  user: null,
  access: null,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk<{ requires_otp: boolean; username?: string }, Props,{ rejectValue: string }>(
  "auth/loginUser",
  async ({ email, password }, thunkAPI) => {
    try {
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return thunkAPI.rejectWithValue(
          data.errors?.general || data.detail || "Login failed"
        );
      }

      return {
        requires_otp: data.requires_otp,
        username: data.username,
      };
    } catch {
      return thunkAPI.rejectWithValue("Failed to login");
    }
  }
);

export const verifyLoginOTP = createAsyncThunk<
  { user: User; access: string },
  VerifyOTPProps,
  { rejectValue: string }
>(
  "auth/verifyLoginOTP",
  async ({ username, otp_code }, thunkAPI) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, otp_code }),
      });

      const data = await response.json();

      if (!response.ok) {
        return thunkAPI.rejectWithValue(
          data.errors?.general || data.detail || "OTP verification failed"
        );
      }

      return {
        user: data.user,
        access: data.access,
      };
    } catch {
      return thunkAPI.rejectWithValue("OTP verification failed");
    }
  }
);

// Refresh access token using HttpOnly cookie
export const refreshAccessToken = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>(
  "auth/refreshAccessToken",
  async (_, thunkAPI) => {
    try {
      const response = await fetch(
        `${API_URL}/auth/refresh/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return thunkAPI.rejectWithValue("Session expired");
      }

      return data.access;
    } catch {
      return thunkAPI.rejectWithValue("Unable to refresh session");
    }
  }
);

// Logout
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as {
      login: AuthProps;
    };

    const access = state.login.access;

    try {
      await fetch(`${API_URL}/auth/logout/`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...(access
            ? { Authorization: `Bearer ${access}` }
            : {}),
        },
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    }
  }
);

// Fetch current user
export const fetchCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("auth/fetchCurrentUser", async (_, thunkAPI) => {
  const access = (thunkAPI.getState() as { loginReducer: AuthProps }).loginReducer.access;
  if (!access) return thunkAPI.rejectWithValue("Not authenticated");

  try {
    const response = await fetch(`${API_URL}/auth/profile/`, {
      headers: { Authorization: `Bearer ${access}`, Accept: "application/json" },
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok) return thunkAPI.rejectWithValue("Unable to load user");
    return data.data; // backend wraps in { success, data }
  } catch {
    return thunkAPI.rejectWithValue("Unable to load user");
  }
});

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.access = null;
      state.error = null;
    },

    clearAuthError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Login failed";
      })

      .addCase(verifyLoginOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(verifyLoginOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.access = action.payload.access;
      })

      .addCase(verifyLoginOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "OTP verification failed";
      })

      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.access = action.payload;
      })

      .addCase(refreshAccessToken.rejected, (state) => {
        state.user = null;
        state.access = null;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.access = null;
        state.error = null;
      })

      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
  },
});

export const { logout, clearAuthError } = loginSlice.actions;
export const loginReducer = loginSlice.reducer;