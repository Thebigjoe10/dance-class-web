/**
 * API Usage Examples
 *
 * This file contains examples of how to use the API configuration
 * and helper functions defined in api-config.js
 */

// ============================================
// Example 1: Fetch all classes
// ============================================
function loadClasses() {
  apiGet(API_ENDPOINTS.classes.list)
    .then(classes => {
      console.log('Classes loaded:', classes);
      // Display classes in the UI
      displayClasses(classes);
    })
    .catch(error => {
      console.error('Error loading classes:', error);
      alert('Failed to load classes. Please try again.');
    });
}

// ============================================
// Example 2: Fetch a specific class by ID
// ============================================
function loadClassDetails(classId) {
  apiGet(API_ENDPOINTS.classes.getById(classId))
    .then(classData => {
      console.log('Class details:', classData);
      // Display class details in the UI
      displayClassDetails(classData);
    })
    .catch(error => {
      console.error('Error loading class details:', error);
      alert('Failed to load class details. Please try again.');
    });
}

// ============================================
// Example 3: User Registration
// ============================================
function registerUser(userData) {
  apiPost(API_ENDPOINTS.auth.register, userData)
    .then(response => {
      console.log('Registration successful:', response);
      // Store the auth token
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      // Redirect to dashboard or home page
      window.location.href = '/index.html';
    })
    .catch(error => {
      console.error('Registration error:', error);
      alert('Registration failed. Please check your details and try again.');
    });
}

// ============================================
// Example 4: User Login
// ============================================
function loginUser(email, password) {
  apiPost(API_ENDPOINTS.auth.login, { email, password })
    .then(response => {
      console.log('Login successful:', response);
      // Store the auth token
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      // Redirect to dashboard
      window.location.href = '/index.html';
    })
    .catch(error => {
      console.error('Login error:', error);
      alert('Login failed. Please check your credentials and try again.');
    });
}

// ============================================
// Example 5: Register for a class
// ============================================
function registerForClass(classId) {
  apiPost(API_ENDPOINTS.classes.register(classId), {})
    .then(response => {
      console.log('Successfully registered for class:', response);
      alert('You have been successfully registered for this class!');
      // Reload the class details
      loadClassDetails(classId);
    })
    .catch(error => {
      console.error('Error registering for class:', error);
      alert('Failed to register for class. Please make sure you are logged in.');
    });
}

// ============================================
// Example 6: Fetch all events
// ============================================
function loadEvents() {
  apiGet(API_ENDPOINTS.events.list)
    .then(events => {
      console.log('Events loaded:', events);
      // Display events in the UI
      displayEvents(events);
    })
    .catch(error => {
      console.error('Error loading events:', error);
      alert('Failed to load events. Please try again.');
    });
}

// ============================================
// Example 7: Purchase a ticket
// ============================================
function purchaseTicket(ticketData) {
  apiPost(API_ENDPOINTS.tickets.purchase, ticketData)
    .then(response => {
      console.log('Ticket purchase initiated:', response);
      // Redirect to payment page if available
      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      }
    })
    .catch(error => {
      console.error('Error purchasing ticket:', error);
      alert('Failed to purchase ticket. Please try again.');
    });
}

// ============================================
// Example 8: Get user profile
// ============================================
function loadUserProfile() {
  apiGet(API_ENDPOINTS.users.profile)
    .then(profile => {
      console.log('User profile:', profile);
      // Display profile in the UI
      displayUserProfile(profile);
    })
    .catch(error => {
      console.error('Error loading profile:', error);
      alert('Failed to load profile. Please make sure you are logged in.');
    });
}

// ============================================
// Example 9: Update user profile
// ============================================
function updateUserProfile(profileData) {
  apiPut(API_ENDPOINTS.users.updateProfile, profileData)
    .then(response => {
      console.log('Profile updated:', response);
      alert('Your profile has been updated successfully!');
      // Reload the profile
      loadUserProfile();
    })
    .catch(error => {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    });
}

// ============================================
// Example 10: Fetch notifications
// ============================================
function loadNotifications() {
  apiGet(API_ENDPOINTS.notifications.list)
    .then(notifications => {
      console.log('Notifications loaded:', notifications);
      // Display notifications in the UI
      displayNotifications(notifications);
    })
    .catch(error => {
      console.error('Error loading notifications:', error);
      console.log('Could not load notifications');
    });
}

// ============================================
// Placeholder display functions
// (Replace these with your actual UI update logic)
// ============================================
function displayClasses(classes) {
  console.log('Display classes in UI:', classes);
}

function displayClassDetails(classData) {
  console.log('Display class details in UI:', classData);
}

function displayEvents(events) {
  console.log('Display events in UI:', events);
}

function displayUserProfile(profile) {
  console.log('Display user profile in UI:', profile);
}

function displayNotifications(notifications) {
  console.log('Display notifications in UI:', notifications);
}

// ============================================
// Usage on page load (example)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('API Examples loaded and ready to use!');

  // Example: Load classes when page loads
  // Uncomment the line below to load classes automatically
  // loadClasses();

  // Example: Load events when page loads
  // Uncomment the line below to load events automatically
  // loadEvents();
});
