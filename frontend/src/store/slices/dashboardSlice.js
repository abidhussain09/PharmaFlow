import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchDashboardAnalytics = createAsyncThunk(
  'dashboard/fetchAnalytics',
  async (period = '1month', { rejectWithValue }) => {
    try {
      const response = await api.get(`/dashboard/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

export const fetchRecentSales = createAsyncThunk(
  'dashboard/fetchRecentSales',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await api.get(`/dashboard/recent-sales?limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent sales');
    }
  }
);

const initialState = {
  analytics: {
    summary: {
      totalSales: 0,
      totalProfit: 0,
      totalProducts: 0,
      totalCustomers: 0,
      lowStockProducts: 0,
    },
    chartData: [],
    period: '1month',
  },
  recentSales: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPeriod: (state, action) => {
      state.analytics.period = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Analytics
      .addCase(fetchDashboardAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchDashboardAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Recent Sales
      .addCase(fetchRecentSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentSales.fulfilled, (state, action) => {
        state.loading = false;
        state.recentSales = action.payload;
      })
      .addCase(fetchRecentSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setPeriod } = dashboardSlice.actions;
export default dashboardSlice.reducer;
