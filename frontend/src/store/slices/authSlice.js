import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for authentication
export const signup = createAsyncThunk(
  'auth/signup',
  async ({ shopName, email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/signup', { shopName, email, password });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Signup failed');
    }
  }
);

export const guestSignup = createAsyncThunk(
  'auth/guestSignup',
  async ({ shopName, email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/guest-signup', { shopName, email, password });
      const { token, shopName: returnedShopName } = response.data;

      // Store token and session info in localStorage
      const sessionStart = new Date().toISOString();
      localStorage.setItem('token', token);
      localStorage.setItem('shopName', returnedShopName);
      localStorage.setItem('isGuest', 'true');
      localStorage.setItem('guestSessionStart', sessionStart);

      return { token, shopName: returnedShopName, isGuest: true, guestSessionStart: sessionStart };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Guest signup failed');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, shopName } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('shopName', shopName);
      
      return { token, shopName };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      // If it's a guest account, call the cleanup endpoint
      if (auth.isGuest) {
        await api.post('/auth/guest-cleanup');
      }

      localStorage.removeItem('token');
      localStorage.removeItem('shopName');
      localStorage.removeItem('isGuest');
      localStorage.removeItem('guestSessionStart');
      return {};
    } catch (error) {
      // Even if cleanup fails, still logout locally
      localStorage.removeItem('token');
      localStorage.removeItem('shopName');
      localStorage.removeItem('isGuest');
      localStorage.removeItem('guestSessionStart');
      return rejectWithValue(error.response?.data?.message || 'Logout cleanup failed');
    }
  }
);

// Check if user is already logged in (on app startup)
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const shopName = localStorage.getItem('shopName');
      
      if (!token) {
        throw new Error('No token found');
      }
      
      // Optionally verify token with backend
      // const response = await api.get('/auth/verify-token');
      
      return { token, shopName };
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('shopName');
      return rejectWithValue('Authentication check failed');
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  shopName: localStorage.getItem('shopName'),
  isGuest: localStorage.getItem('isGuest') === 'true',
  guestSessionStart: localStorage.getItem('guestSessionStart'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  signupStep: 'signup', // 'signup', 'verify-otp', 'complete'
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSignupStep: (state, action) => {
      state.signupStep = action.payload;
    },
    resetAuth: (state) => {
      state.user = null;
      state.token = null;
      state.shopName = null;
      state.isAuthenticated = false;
      state.error = null;
      state.signupStep = 'signup';
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.signupStep = 'verify-otp';
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.signupStep = 'complete';
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.shopName = action.payload.shopName;
        state.isAuthenticated = true;
        state.signupStep = 'signup'; // Reset signup step
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.shopName = null;
        state.isGuest = false;
        state.guestSessionStart = null;
        state.isAuthenticated = false;
        state.error = null;
      })

      // Guest Signup
      .addCase(guestSignup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(guestSignup.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.shopName = action.payload.shopName;
        state.isGuest = action.payload.isGuest;
        state.guestSessionStart = action.payload.guestSessionStart;
        state.isAuthenticated = true;
        state.signupStep = 'complete';
      })
      .addCase(guestSignup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.shopName = action.payload.shopName;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setSignupStep, resetAuth } = authSlice.actions;
export default authSlice.reducer;
