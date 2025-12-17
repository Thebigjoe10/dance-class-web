/**
 * Navigation Component Builder
 *
 * Creates a dynamic navigation bar that adjusts based on user authentication state and role.
 * This should be included after auth.js in pages that need dynamic navigation.
 */

/**
 * Build and inject navigation HTML based on user auth state
 * Call this function on page load to update navigation
 */
function buildNavigation() {
    const user = getCurrentUser();
    const isAuth = isAuthenticated();
    const isAdminUser = isAdmin();
    const isStudentUser = isStudent();

    // Build navigation items based on role
    let navItems = `
        <a href="index.html" class="nav-item nav-link">Home</a>
        <a href="about.html" class="nav-item nav-link">About</a>
        <a href="classes.html" class="nav-item nav-link">Classes</a>
        <a href="event.html" class="nav-item nav-link">Events</a>
    `;

    // Add student-specific menu items
    if (isStudentUser) {
        navItems += `
            <div class="nav-item dropdown">
                <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown">My Account</a>
                <div class="dropdown-menu m-0">
                    <a href="student-dashboard.html" class="dropdown-item">Dashboard</a>
                    <a href="my-classes.html" class="dropdown-item">My Classes</a>
                    <a href="my-tickets.html" class="dropdown-item">My Tickets</a>
                    <a href="#" class="dropdown-item" data-logout>Logout</a>
                </div>
            </div>
        `;
    }

    // Add admin-specific menu items
    if (isAdminUser) {
        navItems += `
            <div class="nav-item dropdown">
                <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown">Admin</a>
                <div class="dropdown-menu m-0">
                    <a href="admin-dashboard.html" class="dropdown-item">Dashboard</a>
                    <a href="admin-classes.html" class="dropdown-item">Manage Classes</a>
                    <a href="admin-events.html" class="dropdown-item">Manage Events</a>
                    <a href="admin-students.html" class="dropdown-item">Manage Students</a>
                    <a href="admin-verify-ticket.html" class="dropdown-item">Verify Tickets</a>
                    <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item" data-logout>Logout</a>
                </div>
            </div>
        `;
    }

    navItems += `<a href="contact.html" class="nav-item nav-link">Contact</a>`;

    // Build button HTML
    let navButton = '';
    if (!isAuth) {
        navButton = `
            <a href="login.html" class="btn btn-light rounded-pill py-2 px-4 me-2 d-none d-lg-inline-block guest-only">Login</a>
            <a href="registration.html" class="btn btn-primary rounded-pill py-2 px-4 ms-lg-2 guest-only">Register Now</a>
        `;
    } else {
        const userName = user.name || user.email.split('@')[0];
        navButton = `
            <div class="d-flex align-items-center">
                <span class="text-primary me-3 d-none d-lg-inline-block">
                    <i class="fas fa-user-circle me-2"></i>${userName}
                </span>
                <a href="#" class="btn btn-outline-primary rounded-pill py-2 px-4" data-logout>
                    <i class="fas fa-sign-out-alt me-2"></i>Logout
                </a>
            </div>
        `;
    }

    // Update navigation container if it exists
    const navContainer = document.querySelector('.navbar-nav');
    if (navContainer) {
        navContainer.innerHTML = navItems;
    }

    // Update button container
    const buttonContainer = document.querySelector('.navbar-collapse');
    if (buttonContainer) {
        const existingButton = buttonContainer.querySelector('.btn, .d-flex.align-items-center');
        if (existingButton) {
            existingButton.remove();
        }
        buttonContainer.insertAdjacentHTML('beforeend', navButton);
    }

    // Re-initialize logout buttons
    const logoutButtons = document.querySelectorAll('[data-logout]');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    });
}

// Call buildNavigation after auth is initialized
if (typeof initAuth === 'function') {
    const originalInitAuth = initAuth;
    initAuth = function() {
        originalInitAuth();
        buildNavigation();
    };
}

// Also call on page load if auth is already initialized
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildNavigation);
} else {
    buildNavigation();
}
