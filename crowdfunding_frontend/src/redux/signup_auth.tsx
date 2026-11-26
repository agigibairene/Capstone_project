/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

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
}

export interface AuthState {
  user: User | null;
  access: string | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const API_URL = import.meta.env.VITE_API_URL;

const initialState: AuthState = {
  user: null,
  access: null,
  loading: false,
  error: null,
  success: false,
};

// SIGNUP
export const signupUser = createAsyncThunk<
  AuthResponse,
  SignupProps,
  { rejectValue: string }
>(
  "auth/signupUser",
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
        ...(signupData.organization && {
          organization: signupData.organization,
        }),
        ...(signupData.investorType && {
          investor_type: signupData.investorType,
        }),
      };

      const response = await fetch(`${API_URL}/auth/signup/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (typeof data === "object" && data !== null) {
          const fieldErrors = data.errors || data;
          const errorMessages: string[] = [];

          const hasFieldErrors = Object.keys(fieldErrors).some(
            (key) =>
              Array.isArray(fieldErrors[key]) ||
              typeof fieldErrors[key] === "string"
          );

          if (hasFieldErrors) {
            for (const [field, messages] of Object.entries(fieldErrors)) {
              if (Array.isArray(messages) && messages.length > 0) {
                const processedMessages = messages.map((msg: any) => {
                  const message = String(msg);

                  if (
                    field === "email" &&
                    message.toLowerCase().includes("email already exists")
                  ) {
                    return "This email is already registered";
                  }

                  if (
                    field === "phone_number" &&
                    message.toLowerCase().includes("phone")
                  ) {
                    return message
                      .replace(/phone\s+number\s+/i, "")
                      .replace(/phone\s+/i, "");
                  }

                  const fieldWords = field.toLowerCase().split("_");
                  let cleanMsg = message;

                  fieldWords.forEach((word) => {
                    const regex = new RegExp(`^${word}\\s+`, "i");
                    cleanMsg = cleanMsg.replace(regex, "");
                  });

                  return cleanMsg;
                });

                errorMessages.push(...processedMessages);
              } else if (typeof messages === "string") {
                let cleanMsg = messages;

                if (
                  field === "email" &&
                  messages.toLowerCase().includes("email already exists")
                ) {
                  cleanMsg = "This email is already registered";
                } else if (
                  field === "phone_number" &&
                  messages.toLowerCase().includes("phone")
                ) {
                  cleanMsg = messages
                    .replace(/phone\s+number\s+/i, "")
                    .replace(/phone\s+/i, "");
                }

                errorMessages.push(cleanMsg);
              }
            }

            if (errorMessages.length > 0) {
              return thunkAPI.rejectWithValue(errorMessages.join(". "));
            }
          }
        }

        return thunkAPI.rejectWithValue(
          data.detail || data.message || "Signup failed. Please try again."
        );
      }

      const userRole = data.user?.role || signupData.role;

      const correctedUser = {
        ...data.user,
        role: userRole,
      };

      return {
        user: correctedUser,
        access: data.access,
      };
    } catch (error: any) {
      console.error("Signup error:", error);

      return thunkAPI.rejectWithValue(
        error.message || "Network error. Please check your connection."
      );
    }
  }
);

const signupSlice = createSlice({
  name: "signup",
  initialState,

  reducers: {
    logout(state) {
      state.user = null;
      state.access = null;
      state.success = false;
      state.error = null;
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
        state.success = true;
        state.error = null;
      })

      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Signup failed";
        state.success = false;
      });
  },
});

export const {
  logout,
  resetSignupState,
  clearError,
  setUserRole,
} = signupSlice.actions;

export const signupReducer = signupSlice.reducer;