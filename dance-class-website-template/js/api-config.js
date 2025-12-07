/**
 * API Configuration for Dance School Frontend
 *
 * This file contains the API base URL and helper functions for making
 * requests to the backend API.
 */

// API Base URL - Change this based on your environment
const API_BASE_URL = 'http://localhost:5000/api';

// API Endpoints
const API_ENDPOINTS = {
  // Authentication
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
    verifyEmail: `${API_BASE_URL}/auth/verify-email`,
  },

  // Users
  users: {
    profile: `${API_BASE_URL}/users/profile`,
    updateProfile: `${API_BASE_URL}/users/profile`,
  },

  // Classes
  classes: {
    list: `${API_BASE_URL}/classes`,
    getById: (id) => `${API_BASE_URL}/classes/${id}`,
    register: (id) => `${API_BASE_URL}/classes/${id}/register`,
    unregister: (id) => `${API_BASE_URL}/classes/${id}/unregister`,
  },

  // Events
  events: {
    list: `${API_BASE_URL}/events`,
    getById: (id) => `${API_BASE_URL}/events/${id}`,
  },

  // Tickets
  tickets: {
    purchase: `${API_BASE_URL}/tickets/purchase`,
    verify: (ticketCode) => `${API_BASE_URL}/tickets/verify/${ticketCode}`,
    myTickets: `${API_BASE_URL}/tickets/my-tickets`,
  },

  // Payments
  payments: {
    initiate: `${API_BASE_URL}/payments/initialize`,
    verify: (reference) => `${API_BASE_URL}/payments/verify/${reference}`,
  },

  // Notifications
  notifications: {
    list: `${API_BASE_URL}/notifications`,
    markAsRead: (id) => `${API_BASE_URL}/notifications/${id}/read`,
  },

  // Health Check
  health: `${API_BASE_URL}/health`,
};

/**
 * Helper function to make API requests
 * @param {string} url - The API endpoint URL
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise} - The API response
 */
async function apiRequest(url, options = {}) {
  try {
    // Get auth token from localStorage if available
    const token = localStorage.getItem('authToken');

    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Make the request
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Parse response
    const data = await response.json();

    // Check if request was successful
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Helper function for GET requests
 */
async function apiGet(url) {
  return apiRequest(url, { method: 'GET' });
}

/**
 * Helper function for POST requests
 */
async function apiPost(url, data) {
  return apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Helper function for PUT requests
 */
async function apiPut(url, data) {
  return apiRequest(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Helper function for DELETE requests
 */
async function apiDelete(url) {
  return apiRequest(url, { method: 'DELETE' });
}

/**
 * Example usage:
 *
 * // Fetch all classes
 * apiGet(API_ENDPOINTS.classes.list)
 *   .then(data => console.log(data))
 *   .catch(error => console.error(error));
 *
 * // Login
 * apiPost(API_ENDPOINTS.auth.login, { email: 'user@example.com', password: 'password' })
 *   .then(data => {
 *     localStorage.setItem('authToken', data.token);
 *     console.log('Logged in!');
 *   })
 *   .catch(error => console.error(error));
 */
