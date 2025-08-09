import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import config from '../../config/env';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { shopName, isGuest } = useSelector((state) => state.auth);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Products', href: '/products', icon: '💊' },
    { name: 'Add Product', href: '/products/add', icon: '➕' },
    { name: 'To Order', href: '/orders', icon: '📋' },
    { name: 'Sales Receipt', href: '/sales/new', icon: '🧾' },
    { name: 'Customers', href: '/customers', icon: '👥' },
  ];

  const handleLogout = () => {
    navigate('/logout');
  };

  const isActive = (href) => location.pathname === href;

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-slate-900 to-slate-800">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <span className="text-white text-xl">×</span>
            </button>
          </div>
          <div className="flex-1 h-0 pt-6 pb-4 overflow-y-auto">
            {/* Mobile Logo */}
            <div className="flex items-center flex-shrink-0 px-6 mb-8">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg p-2 mr-3 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <i className="fas fa-capsules text-xl text-white"></i>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">{config.APP_NAME}</h1>
                  <p className="text-xs text-slate-400">Pharmacy Management</p>
                </div>
              </div>
            </div>

            <nav className="px-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  } group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-gradient-to-b from-slate-900 to-slate-800 shadow-xl">
          <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
            {/* Logo Section */}
            <div className="flex items-center flex-shrink-0 px-6 mb-8">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg p-2 mr-3 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <i className="fas fa-capsules text-xl text-white"></i>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">{config.APP_NAME}</h1>
                  <p className="text-xs text-slate-400">Pharmacy Management</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  } group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Footer */}
            <div className="px-4 mt-6">
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <p className="text-xs text-slate-400 text-center">
                  © 2025 {config.APP_NAME}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-100">
          <button
            className="px-4 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <i className="fas fa-bars text-lg"></i>
          </button>
          <div className="flex-1 px-6 flex justify-between items-center">
            <div className="flex-1 flex items-center">
              <h2 className="text-lg font-medium text-gray-800">
                Hi <span className="text-blue-600 font-semibold">{shopName}</span>! 👋
              </h2>
              {isGuest && (
                <div className="ml-4 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-full">
                  <span className="text-xs font-medium text-yellow-800 flex items-center">
                    <i className="fas fa-clock mr-1"></i>
                    Demo Session
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                {isGuest ? 'End Demo' : 'Logout'}
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
