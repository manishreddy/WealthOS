// WealthOS Auth - uses JWT API backend
// Requires api.js to be loaded first

const Auth = {
  // Check if user is logged in (has valid token)
  isLoggedIn() {
    return WealthAPI.auth.isLoggedIn();
  },

  // Require auth on protected pages - call at page load
  requireAuth() {
    return WealthAPI.auth.requireAuth();
  },

  // Get current user from cache (fast, no API call)
  getCurrentUser() {
    return WealthAPI.auth.getCachedUser();
  },

  // Login - returns { token, user } or throws error
  async login(email, password) {
    return WealthAPI.auth.login(email, password);
  },

  // Signup - returns { token, user } or throws error
  async signup(email, password, familyName) {
    return WealthAPI.auth.signup(email, password, familyName);
  },

  // Logout and redirect
  logout() {
    WealthAPI.auth.logout();
  }
};
