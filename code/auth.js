// WealthOS Auth - session-based auth via Replit Auth
// Requires api.js to be loaded first

const Auth = {
  async isLoggedIn() {
    return WealthAPI.auth.isLoggedIn();
  },

  async requireAuth() {
    return WealthAPI.auth.requireAuth();
  },

  async getCurrentUser() {
    return WealthAPI.auth.getUser();
  },

  login() {
    WealthAPI.auth.login();
  },

  logout() {
    WealthAPI.auth.logout();
  }
};
