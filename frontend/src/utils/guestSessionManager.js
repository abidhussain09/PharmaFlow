import { logout } from '../store/slices/authSlice';

// Guest session duration in milliseconds (1 hour)
const GUEST_SESSION_DURATION = 60 * 60 * 1000; // 1 hour

export class GuestSessionManager {
  constructor(store) {
    this.store = store;
    this.timeoutId = null;
    this.warningTimeoutId = null;
  }

  // Start monitoring guest session
  startSession() {
    const state = this.store.getState();
    if (!state.auth.isGuest || !state.auth.guestSessionStart) {
      return;
    }

    const sessionStart = new Date(state.auth.guestSessionStart);
    const now = new Date();
    const elapsed = now.getTime() - sessionStart.getTime();
    const remaining = GUEST_SESSION_DURATION - elapsed;

    // If session has already expired
    if (remaining <= 0) {
      this.expireSession();
      return;
    }

    // Set timeout for session expiration
    this.timeoutId = setTimeout(() => {
      this.expireSession();
    }, remaining);

    // Set warning timeout (5 minutes before expiration)
    const warningTime = remaining - (5 * 60 * 1000); // 5 minutes before
    if (warningTime > 0) {
      this.warningTimeoutId = setTimeout(() => {
        this.showExpirationWarning();
      }, warningTime);
    }
  }

  // Stop monitoring session
  stopSession() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
      this.warningTimeoutId = null;
    }
  }

  // Check if current session is expired
  isSessionExpired() {
    const state = this.store.getState();
    if (!state.auth.isGuest || !state.auth.guestSessionStart) {
      return false;
    }

    const sessionStart = new Date(state.auth.guestSessionStart);
    const now = new Date();
    const elapsed = now.getTime() - sessionStart.getTime();

    return elapsed >= GUEST_SESSION_DURATION;
  }

  // Get remaining session time in minutes
  getRemainingTime() {
    const state = this.store.getState();
    if (!state.auth.isGuest || !state.auth.guestSessionStart) {
      return 0;
    }

    const sessionStart = new Date(state.auth.guestSessionStart);
    const now = new Date();
    const elapsed = now.getTime() - sessionStart.getTime();
    const remaining = GUEST_SESSION_DURATION - elapsed;

    return Math.max(0, Math.floor(remaining / (60 * 1000))); // Return minutes
  }

  // Show expiration warning
  showExpirationWarning() {
    const remaining = this.getRemainingTime();
    if (remaining > 0) {
      // You can customize this notification
      if (window.confirm(
        `Your demo session will expire in ${remaining} minutes. ` +
        'Your data will be automatically deleted. Do you want to continue?'
      )) {
        // User wants to continue, do nothing
        return;
      } else {
        // User wants to logout now
        this.expireSession();
      }
    }
  }

  // Force session expiration
  expireSession() {
    this.stopSession();
    
    // Show expiration message
    alert(
      'Your demo session has expired. All demo data has been deleted. ' +
      'Thank you for trying PharmaFlow!'
    );
    
    // Dispatch logout action
    this.store.dispatch(logout());
  }

  // Reset session (for when user performs actions)
  resetSession() {
    const state = this.store.getState();
    if (!state.auth.isGuest) {
      return;
    }

    // Update session start time
    const newSessionStart = new Date().toISOString();
    localStorage.setItem('guestSessionStart', newSessionStart);
    
    // Restart monitoring
    this.stopSession();
    this.startSession();
  }
}

// Create singleton instance
let guestSessionManager = null;

export const initializeGuestSessionManager = (store) => {
  if (!guestSessionManager) {
    guestSessionManager = new GuestSessionManager(store);
  }
  return guestSessionManager;
};

export const getGuestSessionManager = () => {
  return guestSessionManager;
};
