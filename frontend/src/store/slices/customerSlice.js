import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (search = '', { rejectWithValue }) => {
    try {
      let url = '/customers';
      if (search) {
        url += `?search=${encodeURIComponent(search)}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers');
    }
  }
);

export const createOrUpdateCustomer = createAsyncThunk(
  'customers/createOrUpdateCustomer',
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await api.post('/customers', customerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save customer');
    }
  }
);

export const fetchCustomerOrderHistory = createAsyncThunk(
  'customers/fetchOrderHistory',
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/customers/${customerId}/orders`);
      return { customerId, orders: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order history');
    }
  }
);

const initialState = {
  customers: [],
  selectedCustomer: null,
  orderHistory: [],
  loading: false,
  error: null,
  searchTerm: '',
};

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
      state.orderHistory = [];
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create/Update Customer
      .addCase(createOrUpdateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrUpdateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        const existingIndex = state.customers.findIndex(c => c._id === action.payload._id);
        if (existingIndex !== -1) {
          state.customers[existingIndex] = action.payload;
        } else {
          state.customers.unshift(action.payload);
        }
      })
      .addCase(createOrUpdateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Order History
      .addCase(fetchCustomerOrderHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerOrderHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.orderHistory = action.payload.orders;
      })
      .addCase(fetchCustomerOrderHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setSelectedCustomer, 
  clearSelectedCustomer, 
  setSearchTerm 
} = customerSlice.actions;
export default customerSlice.reducer;
