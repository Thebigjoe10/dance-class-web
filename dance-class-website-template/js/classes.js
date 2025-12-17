/**
 * Classes Module
 * Handles class browsing, filtering, and enrollment
 */

let allClasses = [];
let filteredClasses = [];

// Map day of week numbers to names
const DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

// Load all classes from API
async function loadClasses() {
    const loadingEl = document.getElementById('classesLoading');
    const errorEl = document.getElementById('classesError');
    const emptyEl = document.getElementById('classesEmpty');
    const containerEl = document.getElementById('classes-container');

    try {
        // Show loading
        if (loadingEl) loadingEl.style.display = 'block';
        if (errorEl) errorEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'none';
        if (containerEl) containerEl.innerHTML = '';

        // Fetch classes from API
        const response = await apiGet(API_ENDPOINTS.classes.list);

        // Extract classes array from response
        allClasses = response.data || response.classes || [];
        filteredClasses = [...allClasses];

        // Hide loading
        if (loadingEl) loadingEl.style.display = 'none';

        // Display classes
        displayClasses();
    } catch (error) {
        console.error('Error fetching classes:', error);
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) {
            errorEl.style.display = 'block';
            const errorMessageEl = document.getElementById('classesErrorMessage');
            if (errorMessageEl) {
                errorMessageEl.textContent = error.message || 'Failed to load classes. Please try again later.';
            }
        }
    }
}

// Display classes in the grid
function displayClasses() {
    const containerEl = document.getElementById('classes-container');
    const emptyEl = document.getElementById('classesEmpty');

    if (!containerEl) return;

    if (filteredClasses.length === 0) {
        containerEl.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    containerEl.innerHTML = filteredClasses.map((classItem, index) => {
        const delay = (index % 4) * 0.2 + 0.1;
        const imgIndex = (index % 3) + 1;
        const price = classItem.price ? `$${classItem.price}` : 'Free';
        const enrolled = classItem.enrolledCount || classItem._count?.registrations || 0;
        const capacity = classItem.capacity || 0;
        const spotsLeft = capacity - enrolled;
        const dayName = getDayName(classItem.dayOfWeek);

        return `
            <div class="col-md-6 col-lg-4 col-xl-3 wow fadeInUp" data-wow-delay="${delay}s">
                <div class="class-item bg-white rounded h-100">
                    <div class="class-img rounded-top">
                        <img src="img/class-${imgIndex}.jpg" class="img-fluid rounded-top w-100" alt="${classItem.name}">
                        <div class="position-absolute top-0 end-0 m-3">
                            <span class="badge bg-primary">${classItem.level}</span>
                        </div>
                    </div>
                    <div class="rounded-bottom p-4 d-flex flex-column">
                        <a href="class-detail.html?id=${classItem.id}" class="h4 mb-3 d-block text-dark">${classItem.name}</a>
                        <div class="mb-3">
                            <p class="mb-2"><i class="fas fa-user-tie text-primary me-2"></i>${classItem.instructor || 'TBA'}</p>
                            <p class="mb-2"><i class="fas fa-music text-primary me-2"></i>${classItem.style}</p>
                            <p class="mb-2"><i class="fas fa-calendar-alt text-primary me-2"></i>${dayName}</p>
                            <p class="mb-2"><i class="fas fa-clock text-primary me-2"></i>${classItem.startTime} - ${classItem.endTime}</p>
                            <p class="mb-2"><i class="fas fa-users text-primary me-2"></i>${enrolled}/${capacity} enrolled</p>
                            ${spotsLeft > 0 && spotsLeft <= 5 ? `<p class="mb-2 text-warning"><i class="fas fa-exclamation-triangle me-2"></i>Only ${spotsLeft} spots left!</p>` : ''}
                            ${spotsLeft === 0 ? `<p class="mb-2 text-danger"><i class="fas fa-times-circle me-2"></i>Class Full</p>` : ''}
                        </div>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="h5 mb-0 text-primary">${price}</span>
                            </div>
                            <a class="btn btn-primary rounded-pill text-white py-2 px-4 w-100" href="class-detail.html?id=${classItem.id}">View Details</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Get day name from day number (0 = Sunday, 1 = Monday, etc.)
function getDayName(dayNum) {
    return DAY_NAMES[dayNum] || '';
}

// Setup filter event listeners
function setupFilters() {
    const levelFilter = document.getElementById('levelFilter');
    const dayFilter = document.getElementById('dayFilter');
    const styleFilter = document.getElementById('styleFilter');

    if (levelFilter) levelFilter.addEventListener('change', applyFilters);
    if (dayFilter) dayFilter.addEventListener('change', applyFilters);
    if (styleFilter) styleFilter.addEventListener('input', applyFilters);
}

// Apply filters to classes
function applyFilters() {
    const levelFilter = document.getElementById('levelFilter');
    const dayFilter = document.getElementById('dayFilter');
    const styleFilter = document.getElementById('styleFilter');

    const levelValue = levelFilter ? levelFilter.value : '';
    const dayValue = dayFilter ? dayFilter.value : '';
    const styleValue = styleFilter ? styleFilter.value.toLowerCase() : '';

    filteredClasses = allClasses.filter(classItem => {
        // Check level filter
        const matchesLevel = !levelValue || classItem.level === levelValue;

        // Check day filter - compare the day name
        const dayName = getDayName(classItem.dayOfWeek);
        const matchesDay = !dayValue || dayName === dayValue;

        // Check style filter
        const matchesStyle = !styleValue || classItem.style.toLowerCase().includes(styleValue);

        return matchesLevel && matchesDay && matchesStyle;
    });

    displayClasses();
}

// Initialize on page load
if (document.getElementById('classes-container')) {
    document.addEventListener('DOMContentLoaded', async () => {
        await loadClasses();
        setupFilters();
    });
}
