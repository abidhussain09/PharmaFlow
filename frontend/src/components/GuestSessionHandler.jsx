import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useStore } from 'react-redux';
import { initializeGuestSessionManager, getGuestSessionManager } from '../utils/guestSessionManager';
import { checkAuth } from '../store/slices/authSlice';

const GuestSessionHandler = () => {
  const store = useStore();
  const dispatch = useDispatch();
  const { isAuthenticated, isGuest, guestSessionStart } = useSelector((state) => state.auth);

  useEffect(() => {
    // Initialize the guest session manager
    initializeGuestSessionManager(store);
    
    // Check authentication status on app load
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(checkAuth());
    }
  }, [store, dispatch]);

  useEffect(() => {
    const sessionManager = getGuestSessionManager();
    
    if (isAuthenticated && isGuest && guestSessionStart) {
      // Check if session is already expired
      if (sessionManager && sessionManager.isSessionExpired()) {
        sessionManager.expireSession();
        return;
      }
      
      // Start monitoring the guest session
      if (sessionManager) {
        sessionManager.startSession();
      }
    } else if (sessionManager) {
      // Stop monitoring if not a guest or not authenticated
      sessionManager.stopSession();
    }

    // Cleanup function
    return () => {
      if (sessionManager) {
        sessionManager.stopSession();
      }
    };
  }, [isAuthenticated, isGuest, guestSessionStart]);

  // This component doesn't render anything
  return null;
};

export default GuestSessionHandler;
