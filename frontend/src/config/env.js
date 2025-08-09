// Environment configuration
const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'PharmaFlow',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  
  // Feature flags
  FEATURES: {
    ENABLE_ANALYTICS: true,
    ENABLE_PDF_RECEIPTS: true,
    ENABLE_EMAIL_NOTIFICATIONS: false, // Disabled by default since email service might not be configured
  },
  
  // UI Configuration
  UI: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_SEARCH_RESULTS: 50,
    DEBOUNCE_DELAY: 300, // milliseconds
  },
  
  // Business Logic
  BUSINESS: {
    DEFAULT_MARGIN_PERCENTAGE: 20,
    DEFAULT_LOW_STOCK_THRESHOLD: 5,
    CURRENCY: 'INR',
    CURRENCY_SYMBOL: '₹',
  },
};

// Validation
if (!config.API_BASE_URL) {
  console.error('API_BASE_URL is not configured');
}

// Development helpers
if (config.ENVIRONMENT === 'development') {
  console.log('🔧 Running in development mode');
  console.log('📡 API Base URL:', config.API_BASE_URL);
  
  // Make config available in browser console for debugging
  window.__PHARMAFLOW_CONFIG__ = config;
}

export default config;
