/**
 * Authentication Utility Module
 *
 * Handles all authentication-related functionality including:
 * - Login/Logout
 * - Token management
 * - Auth state checking
 * - User role verification
 * - Protected page access
 */

// Storage keys
const TOKEN_KEY = 'authToken';
const USER_KEY = 'currentUser';

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user has valid token
 */
function isAuthenticated() {
  const token = localStorage.getItem(TOKEN_KEY);
  return !!token;
}

/**
 * Get current user from localStorage
 * @returns {object|null} - User object or null if not authenticated
 */
function getCurrentUser() {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Get auth token
 * @returns {string|null} - Auth token or null
 */
function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Save auth data to localStorage
 * @param {string} token - JWT token
 * @param {object} user - User object
 */
function saveAuthData(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Clear auth data from localStorage
 */
function clearAuthData() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Check if current user is admin
 * @returns {boolean} - True if user is admin
 */
function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'ADMIN';
}

/**
 * Check if current user is student
 * @returns {boolean} - True if user is student
 */
function isStudent() {
  const user = getCurrentUser();
  return user && user.role === 'STUDENT';
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} - Login response with token and user data
 */
async function login(email, password) {
  try {
    const response = await apiPost(`${API_BASE_URL}/auth/login`, {
      email,
      password
    });

    // Save token and user data
    saveAuthData(response.token, response.user);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Register new student
 * @param {object} userData - User registration data
 * @returns {Promise<object>} - Registration response
 */
async function register(userData) {
  try {
    const response = await apiPost(`${API_BASE_URL}/auth/register`, userData);

    // Save token and user data if returned
    if (response.token && response.user) {
      saveAuthData(response.token, response.user);
    }

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Logout user
 */
function logout() {
  clearAuthData();
  // Redirect to home page
  window.location.href = 'index.html';
}

/**
 * Get current user profile from API
 * @returns {Promise<object>} - User profile data
 */
async function fetchUserProfile() {
  try {
    const response = await apiGet(`${API_BASE_URL}/auth/me`);

    // Update stored user data
    const user = getCurrentUser();
    if (user) {
      saveAuthData(getAuthToken(), { ...user, ...response });
    }

    return response;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // If token is invalid, clear auth data
    if (error.message && error.message.includes('token')) {
      clearAuthData();
    }
    throw error;
  }
}

/**
 * Require authentication - redirect to login if not authenticated
 * Call this at the top of protected pages
 */
function requireAuth() {
  if (!isAuthenticated()) {
    // Save intended destination
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    // Redirect to login
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

/**
 * Require admin role - redirect if not admin
 * Call this at the top of admin-only pages
 */
function requireAdmin() {
  if (!requireAuth()) return false;

  if (!isAdmin()) {
    alert('Access denied. Admin privileges required.');
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

/**
 * Require student role - redirect if not student
 * Call this at the top of student-only pages
 */
function requireStudent() {
  if (!requireAuth()) return false;

  if (!isStudent()) {
    alert('Access denied. Student account required.');
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

/**
 * Redirect to appropriate dashboard based on user role
 */
function redirectToDashboard() {
  if (isAdmin()) {
    window.location.href = 'admin-dashboard.html';
  } else if (isStudent()) {
    window.location.href = 'student-dashboard.html';
  } else {
    window.location.href = 'index.html';
  }
}

/**
 * Handle redirect after login
 * Checks if there was an intended destination before login
 */
function handlePostLoginRedirect() {
  const redirectPath = localStorage.getItem('redirectAfterLogin');
  localStorage.removeItem('redirectAfterLogin');

  if (redirectPath) {
    window.location.href = redirectPath;
  } else {
    redirectToDashboard();
  }
}

/**
 * Update navigation based on auth state
 * Shows/hides menu items based on whether user is logged in and their role
 */
function updateNavigation() {
  const user = getCurrentUser();
  const isAuth = isAuthenticated();

  // Get navigation elements
  const authLinks = document.querySelectorAll('.auth-required');
  const guestLinks = document.querySelectorAll('.guest-only');
  const adminLinks = document.querySelectorAll('.admin-only');
  const studentLinks = document.querySelectorAll('.student-only');
  const userNameElements = document.querySelectorAll('.user-name');

  // Show/hide based on auth state
  authLinks.forEach(el => {
    el.style.display = isAuth ? '' : 'none';
  });

  guestLinks.forEach(el => {
    el.style.display = isAuth ? 'none' : '';
  });

  // Show/hide based on role
  if (isAuth && user) {
    adminLinks.forEach(el => {
      el.style.display = user.role === 'ADMIN' ? '' : 'none';
    });

    studentLinks.forEach(el => {
      el.style.display = user.role === 'STUDENT' ? '' : 'none';
    });

    // Update user name displays
    userNameElements.forEach(el => {
      el.textContent = user.name || user.email;
    });
  } else {
    adminLinks.forEach(el => el.style.display = 'none');
    studentLinks.forEach(el => el.style.display = 'none');
  }
}

/**
 * Initialize auth state on page load
 * Call this in DOMContentLoaded event on every page
 */
function initAuth() {
  updateNavigation();

  // Add logout button listeners
  const logoutButtons = document.querySelectorAll('.logout-btn, [data-logout]');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  });
}

/**
 * Show error message in a formatted way
 * @param {string} message - Error message
 * @param {HTMLElement} container - Container element to show error in
 */
function showError(message, container) {
  if (!container) return;

  container.innerHTML = `
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="fas fa-exclamation-circle me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;

  // Scroll to error
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Show success message in a formatted way
 * @param {string} message - Success message
 * @param {HTMLElement} container - Container element to show message in
 */
function showSuccess(message, container) {
  if (!container) return;

  container.innerHTML = `
    <div class="alert alert-success alert-dismissible fade show" role="alert">
      <i class="fas fa-check-circle me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;

  // Scroll to message
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Show loading state on button
 * @param {HTMLElement} button - Button element
 * @param {boolean} loading - Loading state
 */
function setButtonLoading(button, loading) {
  if (!button) return;

  if (loading) {
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText || button.innerHTML;
  }
}

// Initialize auth on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}
