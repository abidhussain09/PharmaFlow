import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const config = {
    APP_NAME: 'PharmaFlow'
};

export const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get the isAuthenticated state from your actual Redux store
    const { isAuthenticated } = useSelector((state) => state.auth);

    // This function dispatches the logout action and redirects the user
    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div>
            <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/">
                            <div className="flex items-center">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-2 mr-3">
                                    <i className="fas fa-capsules text-xl text-white"></i>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {config.APP_NAME}
                                    </h1>
                                    <p className="text-xs text-gray-500">Pharmacy Management</p>
                                </div>
                            </div>
                        </Link>

                        {/* --- Conditional Navigation Links --- */}
                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                // If the user IS logged in, show Dashboard and Logout
                                <>
                                    <Link
                                        to="/dashboard"
                                        className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link to='/logout'
                                    
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                                        >
                                        Logout
                                    </Link>
                                </>
                            ) : (
                                // If the user is NOT logged in, show Sign In and Get Started
                                <>
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
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
