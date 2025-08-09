import { Link } from 'react-router-dom';
import config from '../config/env';

const LandingPage = () => {
  const features = [
    {
      icon: '📊',
      title: 'Smart Analytics',
      description: 'Track sales, profits, and inventory with real-time analytics and insights.'
    },
    {
      icon: '💊',
      title: 'Inventory Management',
      description: 'Manage your medicine stock, track expiry dates, and get low stock alerts.'
    },
    {
      icon: '🧾',
      title: 'Sales Management',
      description: 'Process sales quickly, generate receipts, and maintain customer records.'
    },
    {
      icon: '📈',
      title: 'Profit Tracking',
      description: 'Monitor your profit margins and identify your best-selling products.'
    },
    {
      icon: '⚠️',
      title: 'Smart Alerts',
      description: 'Get notified about low stock, expiring medicines, and important updates.'
    },
    {
      icon: '📱',
      title: 'Mobile Friendly',
      description: 'Access your pharmacy data anywhere with our responsive design.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-2 mr-3 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <i className="fas fa-capsules text-xl text-white"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {config.APP_NAME}
                </h1>
                <p className="text-xs text-gray-500">Pharmacy Management</p>
              </div>
            </div>
            
            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Modern
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {' '}Pharmacy{' '}
                </span>
                Management
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Streamline your pharmacy operations with our comprehensive management system. 
                Track inventory, manage sales, and grow your business with powerful analytics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
                >
                  <i className="fas fa-user-plus mr-2"></i>
                  Demo Signup
                </Link>
                <Link
                  to="/register"
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-gray-400 transition-colors inline-flex items-center justify-center"
                >
                  <i className="fas fa-arrow-right mr-2"></i>
                  Get Started
                </Link>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <i className="fas fa-info-circle text-yellow-600 mr-2"></i>
                  <p className="text-sm text-yellow-800">
                    <strong>Demo Account:</strong> Your demo data will be automatically deleted when you log out. Perfect for testing!
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content - Demo Dashboard */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 mb-4">
                  <h3 className="text-white font-semibold mb-2">Dashboard Overview</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-white/80 text-sm">Total Sales</div>
                      <div className="text-white font-bold text-lg">₹45,230</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-white/80 text-sm">Products</div>
                      <div className="text-white font-bold text-lg">1,247</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="mr-3">💊</span>
                      <span className="font-medium">Paracetamol 500mg</span>
                    </div>
                    <span className="text-green-600 font-semibold">₹120</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="mr-3">🩹</span>
                      <span className="font-medium">Bandage Roll</span>
                    </div>
                    <span className="text-green-600 font-semibold">₹45</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center">
                      <span className="mr-3">⚠️</span>
                      <span className="font-medium text-orange-800">Low Stock Alert</span>
                    </div>
                    <span className="text-orange-600 font-semibold">5 items</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Pharmacy
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive solution helps you streamline operations, increase efficiency, and grow your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-3 w-fit mb-4">
                  <span className="text-2xl text-white">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Try PharmaFlow?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Experience our pharmacy management system with a demo account. No commitment required!
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl inline-flex items-center"
          >
            <i className="fas fa-rocket mr-2"></i>
            Try Demo Account
          </Link>
          <div className="mt-6 p-4 bg-blue-800/30 rounded-lg border border-blue-400/30">
            <div className="flex items-center justify-center">
              <i className="fas fa-clock text-blue-200 mr-2"></i>
              <p className="text-blue-100 text-sm">
                Demo data automatically deleted on logout • No personal information required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-2 mr-3">
                <i className="fas fa-capsules text-xl text-white"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold">{config.APP_NAME}</h3>
                <p className="text-gray-400 text-sm">Pharmacy Management System</p>
              </div>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 {config.APP_NAME}. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
