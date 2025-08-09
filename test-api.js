#!/usr/bin/env node

/**
 * Simple API Test Script for PharmaFlow
 * Tests basic functionality of all API endpoints
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const TEST_EMAIL = 'test-' + Date.now() + '@example.com';
const TEST_PASSWORD = 'testpassword123';
const TEST_SHOP_NAME = 'Test Pharmacy ' + Date.now();

let authToken = '';
let testProductId = '';
let testSaleId = '';

console.log('🧪 Starting PharmaFlow API Tests...');
console.log('📡 API Base URL:', API_BASE_URL);
console.log('');

// Helper function for API calls
async function apiCall(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('🏥 Testing health check...');
  const result = await apiCall('GET', '/../');
  if (result.success) {
    console.log('✅ Health check passed');
  } else {
    console.log('❌ Health check failed:', result.error);
  }
  return result.success;
}

async function testSignup() {
  console.log('📝 Testing user signup...');
  const result = await apiCall('POST', '/auth/signup', {
    shopName: TEST_SHOP_NAME,
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  });
  
  if (result.success) {
    console.log('✅ Signup successful');
    console.log('📧 OTP (for testing):', result.data.otp);
    return result.data.otp;
  } else {
    console.log('❌ Signup failed:', result.error);
    return null;
  }
}

async function testOTPVerification(otp) {
  console.log('🔐 Testing OTP verification...');
  const result = await apiCall('POST', '/auth/verify-otp', {
    email: TEST_EMAIL,
    otp: otp
  });
  
  if (result.success) {
    console.log('✅ OTP verification successful');
  } else {
    console.log('❌ OTP verification failed:', result.error);
  }
  return result.success;
}

async function testLogin() {
  console.log('🔑 Testing login...');
  const result = await apiCall('POST', '/auth/login', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  });
  
  if (result.success) {
    authToken = result.data.token;
    console.log('✅ Login successful');
    console.log('🎫 Token received');
  } else {
    console.log('❌ Login failed:', result.error);
  }
  return result.success;
}

async function testCreateProduct() {
  console.log('💊 Testing product creation...');
  const result = await apiCall('POST', '/products', {
    name: 'Test Medicine',
    description: 'Test medicine for API testing',
    wholesaler: 'Test Wholesaler',
    price: 100,
    quantity: 50,
    lowStockThreshold: 5,
    category: 'Test Category'
  }, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    testProductId = result.data._id;
    console.log('✅ Product created successfully');
    console.log('🆔 Product ID:', testProductId);
  } else {
    console.log('❌ Product creation failed:', result.error);
  }
  return result.success;
}

async function testGetProducts() {
  console.log('📋 Testing get products...');
  const result = await apiCall('GET', '/products', null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    console.log('✅ Products retrieved successfully');
    console.log('📊 Product count:', result.data.length);
  } else {
    console.log('❌ Get products failed:', result.error);
  }
  return result.success;
}

async function testDashboardAnalytics() {
  console.log('📈 Testing dashboard analytics...');
  const result = await apiCall('GET', '/dashboard/analytics', null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    console.log('✅ Dashboard analytics retrieved successfully');
    console.log('💰 Total Sales:', result.data.summary.totalSales);
  } else {
    console.log('❌ Dashboard analytics failed:', result.error);
  }
  return result.success;
}

async function testCreateSale() {
  console.log('🧾 Testing sale creation...');
  const result = await apiCall('POST', '/sales', {
    customerInfo: {
      name: 'Test Customer',
      email: 'customer@test.com',
      phone: '+91 9876543210'
    },
    products: [{
      product: testProductId,
      quantity: 2,
      price: 120
    }]
  }, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    testSaleId = result.data.sale._id;
    console.log('✅ Sale created successfully');
    console.log('🆔 Sale ID:', testSaleId);
  } else {
    console.log('❌ Sale creation failed:', result.error);
  }
  return result.success;
}

async function testGetCustomers() {
  console.log('👥 Testing get customers...');
  const result = await apiCall('GET', '/customers', null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    console.log('✅ Customers retrieved successfully');
    console.log('👤 Customer count:', result.data.length);
  } else {
    console.log('❌ Get customers failed:', result.error);
  }
  return result.success;
}

// Main test runner
async function runTests() {
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Signup', fn: testSignup },
    { name: 'Login', fn: testLogin },
    { name: 'Create Product', fn: testCreateProduct },
    { name: 'Get Products', fn: testGetProducts },
    { name: 'Dashboard Analytics', fn: testDashboardAnalytics },
    { name: 'Create Sale', fn: testCreateSale },
    { name: 'Get Customers', fn: testGetCustomers }
  ];
  
  let passed = 0;
  let failed = 0;
  let otp = null;
  
  for (const test of tests) {
    console.log('');
    
    if (test.name === 'User Signup') {
      otp = await test.fn();
      if (otp) {
        // Test OTP verification
        console.log('');
        const otpResult = await testOTPVerification(otp);
        if (otpResult) passed++; else failed++;
      }
      if (otp) passed++; else failed++;
    } else {
      const result = await test.fn();
      if (result) passed++; else failed++;
    }
  }
  
  console.log('');
  console.log('🎯 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! API is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the API configuration.');
  }
}

// Run the tests
runTests().catch(console.error);
