
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL;

interface KYCResponse {
  success: boolean;
  message?: string;
  kyc?: unknown;
  [key: string]: unknown;
}

export 
interface KYCState {
  loading: boolean;
  fetchLoading: boolean;
  error: string | null;
  success: boolean;
  kycData: unknown;
}

interface TokenState {
  loginReducer: { access: string | null };
  signupReducer: { access: string | null };
}

const initialState: KYCState = {
  loading: false,
  fetchLoading: false,
  error: null,
  success: false,
  kycData: null,
};

const selectAccessToken = (state: TokenState) =>
  state.loginReducer.access ?? state.signupReducer.access;

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return (
      data?.message ||
      data?.errors?.general ||
      data?.detail ||
      'The request could not be completed.'
    );
  } catch {
    return 'The request could not be completed.';
  }
}

async function submitKYCRequest(
  endpoint: string,
  formData: FormData,
  token: string,
): Promise<KYCResponse> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export const investorKYC = createAsyncThunk<
  KYCResponse,
  FormData,
  { state: TokenState; rejectValue: string }
>(
  'kyc/investorKYC',
  async (formData, { getState, rejectWithValue }) => {
    const token = selectAccessToken(getState());

    if (!token) {
      return rejectWithValue('Your session has expired. Please log in again.');
    }

    try {
      return await submitKYCRequest(
        '/kyc/investor/submit/',
        formData,
        token,
      );
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Investor KYC submission failed.',
      );
    }
  },
);

export const submitFarmerKYC = createAsyncThunk<
  KYCResponse,
  FormData,
  { state: TokenState; rejectValue: string }
>(
  'kyc/submitFarmerKYC',
  async (formData, { getState, rejectWithValue }) => {
    const token = selectAccessToken(getState());

    if (!token) {
      return rejectWithValue('Your session has expired. Please log in again.');
    }

    try {
      return await submitKYCRequest(
        '/kyc/farmer/submit/',
        formData,
        token,
      );
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Farmer KYC submission failed.',
      );
    }
  },
);

export const fetchUserKYC = createAsyncThunk<
  KYCResponse,
  void,
  { state: TokenState; rejectValue: string }
>(
  'kyc/fetchUserKYC',
  async (_, { getState, rejectWithValue }) => {
    const token = selectAccessToken(getState());

    if (!token) {
      return rejectWithValue('Your session has expired. Please log in again.');
    }

    try {
      const response = await fetch(`${API_URL}/kyc/user/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unable to fetch KYC details.',
      );
    }
  },
);

const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    resetKYCState: () => initialState,
    clearKYCError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Investor submission
      .addCase(investorKYC.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(investorKYC.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.kycData = action.payload.kyc ?? action.payload;
      })
      .addCase(investorKYC.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload ?? action.error.message ?? 'Investor KYC failed.';
      })

      // Farmer submission
      .addCase(submitFarmerKYC.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitFarmerKYC.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.kycData = action.payload.kyc ?? action.payload;
      })
      .addCase(submitFarmerKYC.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload ?? action.error.message ?? 'Farmer KYC failed.';
      })

      // Fetch existing KYC details
      .addCase(fetchUserKYC.pending, (state) => {
        state.fetchLoading = true;
        state.error = null;
      })
      .addCase(fetchUserKYC.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.kycData = action.payload.kyc ?? action.payload;
      })
      .addCase(fetchUserKYC.rejected, (state, action) => {
        state.fetchLoading = false;
        state.error = action.payload ?? action.error.message ?? 'Unable to fetch KYC.';
      });
  },
});

export const { resetKYCState, clearKYCError } = kycSlice.actions;
export default kycSlice.reducer;
