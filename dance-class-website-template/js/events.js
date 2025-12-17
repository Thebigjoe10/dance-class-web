/**
 * Events Module
 * Handles event browsing and ticket purchasing
 */

// Load all events
async function loadEvents() {
    try {
        const data = await apiGet(API_ENDPOINTS.events.list);
        displayEvents(data.data || data.events || []);
    } catch (error) {
        console.error('Error loading events:', error);
        showMessage('error', 'Failed to load events');
    }
}

// Display events in the grid
function displayEvents(events) {
    const container = document.getElementById('events-container');
    if (!container) return;

    if (events.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-center">No upcoming events</p></div>';
        return;
    }

    container.innerHTML = events.map(event => `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="event-card h-100">
                <div class="event-image" style="background-image: url('${event.imageUrl || 'img/default-event.jpg'}');">
                    <div class="event-date">
                        <div class="date-day">${formatEventDay(event.date)}</div>
                        <div class="date-month">${formatEventMonth(event.date)}</div>
                    </div>
                </div>
                <div class="event-body p-4">
                    <h5 class="event-title mb-3">${event.title}</h5>
                    <p class="event-venue mb-2"><i class="fas fa-map-marker-alt me-2"></i>${event.venue}</p>
                    <p class="event-time mb-2"><i class="fas fa-clock me-2"></i>${event.time}</p>
                    <p class="event-price mb-3">
                        <i class="fas fa-ticket-alt me-2"></i>
                        <strong>₦${parseFloat(event.price).toLocaleString()}</strong>
                    </p>
                    <a href="event-detail.html?id=${event.id}" class="btn btn-primary w-100">View Details</a>
                </div>
            </div>
        </div>
    `).join('');
}

// Format event day
function formatEventDay(dateStr) {
    const date = new Date(dateStr);
    return date.getDate();
}

// Format event month
function formatEventMonth(dateStr) {
    const date = new Date(dateStr);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return months[date.getMonth()];
}

// Initialize on page load
if (document.getElementById('events-container')) {
    document.addEventListener('DOMContentLoaded', loadEvents);
}
