# Dance Class Web Application - Architecture Documentation

## Overview

This is a full-stack dance class and event ticketing platform built with:
- **Backend**: Express.js + TypeScript + Prisma + PostgreSQL
- **Frontend**: Static HTML/CSS/JavaScript with Bootstrap 5
- **Authentication**: JWT-based with role-based access control (STUDENT, ADMIN)
- **Payments**: Paystack integration for event ticket purchases

## Current Status

### ✅ Backend (Production Ready)
- Comprehensive REST API with all necessary endpoints
- JWT authentication and authorization
- Database schema with all required models
- Payment processing with Paystack webhook handling
- Email notifications (registration, tickets, reminders)
- QR code generation for tickets
- Rate limiting and security middleware

### ⚠️ Frontend (Template Only - Needs Implementation)
- Beautiful static HTML pages exist
- NO dynamic functionality
- NO API integration
- NO authentication UI (except registration form)
- NO dashboards
- NO actual ticketing flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  (Static HTML/CSS/JS + Bootstrap 5 + jQuery)                │
│                                                              │
│  • Public pages (landing, about, contact)                   │
│  • Authentication (login, register)                         │
│  • Student dashboard (my classes, my tickets)               │
│  • Admin dashboard (manage classes, events, verify tickets) │
│  • Class browsing & enrollment                              │
│  • Event listing & ticket purchase                          │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
                    HTTP/REST API Calls
                  (Authorization: Bearer JWT)
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                               │
│              (Express.js + TypeScript)                       │
│                                                              │
│  Routes:                                                     │
│  • /api/auth      - Authentication & registration           │
│  • /api/users     - User profile management                 │
│  • /api/classes   - Class CRUD, enrollment, attendance      │
│  • /api/events    - Event CRUD, ticket checkout             │
│  • /api/tickets   - Ticket viewing, verification, linking   │
│  • /api/payments  - Payment verification, refunds           │
│  • /api/paystack  - Webhook for payment confirmation        │
│  • /api/notifications - User notifications                  │
│                                                              │
│  Middleware:                                                 │
│  • authenticate - Verify JWT token                          │
│  • authorize(role) - Check STUDENT/ADMIN role               │
│  • validateRequest - Zod schema validation                  │
│  • errorHandler - Global error handling                     │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
                      Prisma ORM
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                            │
│                    (PostgreSQL)                              │
│                                                              │
│  Tables:                                                     │
│  • User - User accounts (email, password, role)             │
│  • StudentProfile - Student details (level, guardian, etc)  │
│  • Class - Dance classes (schedule, instructor, capacity)   │
│  • ClassRegistration - Student enrollments                  │
│  • Attendance - Class attendance records                    │
│  • Event - Dance events (shows, workshops)                  │
│  • Ticket - Event tickets with QR codes                     │
│  • PaymentLog - Payment transaction records                 │
│  • Notification - User notifications                        │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                          │
│                                                              │
│  • Paystack API - Payment processing                        │
│  • Email Service - Notifications (Nodemailer)               │
│  • QR Code Generator - Ticket QR codes                      │
└─────────────────────────────────────────────────────────────┘
```

## API Communication

### Base URL
```
http://localhost:5000/api
```

### Authentication Flow
```
1. User registers: POST /api/auth/register
   → Returns JWT token
   → Store in localStorage as 'authToken'

2. User logs in: POST /api/auth/login
   → Returns JWT token + user info
   → Store token in localStorage

3. Protected requests:
   → Add header: Authorization: Bearer <token>
   → Backend validates JWT and extracts user info
```

### Request/Response Format
All API requests/responses use JSON format.

**Example Request:**
```javascript
const response = await fetch('http://localhost:5000/api/classes', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
});
const data = await response.json();
```

## Database Schema

### User & Authentication
```
User
├── id (UUID, PK)
├── email (String, unique)
├── passwordHash (String)
├── role (STUDENT | ADMIN)
├── name (String)
├── phone (String, optional)
├── verified (Boolean)
└── verificationToken (String, optional)

StudentProfile
├── id (UUID, PK)
├── userId (UUID, FK → User, unique)
├── level (BEGINNER | INTERMEDIATE | ADVANCED | PROFESSIONAL)
├── guardianName (String, optional)
├── dateOfBirth (DateTime, optional)
├── address (String, optional)
├── emergencyContact (String, optional)
└── medicalInfo (String, optional)
```

### Classes & Enrollment
```
Class
├── id (UUID, PK)
├── name (String)
├── style (String) - e.g., "Hip Hop", "Ballet"
├── level (ClassLevel)
├── instructor (String)
├── description (String, optional)
├── dayOfWeek (Int) - 0=Sunday, 6=Saturday
├── startTime (String) - e.g., "14:00"
├── endTime (String)
├── duration (Int) - minutes
├── capacity (Int) - default: 20
├── price (Float, optional)
├── isActive (Boolean)
├── startDate (DateTime)
└── endDate (DateTime, optional)

ClassRegistration
├── id (UUID, PK)
├── classId (UUID, FK → Class)
├── studentId (UUID, FK → User)
└── status (ACTIVE | INACTIVE | CANCELLED)
    UNIQUE(classId, studentId)

Attendance
├── id (UUID, PK)
├── classId (UUID, FK → Class)
├── studentId (UUID, FK → User)
├── date (DateTime)
├── present (Boolean)
└── notes (String, optional)
    UNIQUE(classId, studentId, date)
```

### Events & Ticketing
```
Event
├── id (UUID, PK)
├── title (String)
├── description (String, optional)
├── date (DateTime)
├── time (String)
├── venue (String)
├── capacity (Int)
├── price (Float)
├── imageUrl (String, optional)
└── isActive (Boolean)

Ticket
├── id (UUID, PK)
├── eventId (UUID, FK → Event)
├── buyerName (String)
├── buyerEmail (String)
├── buyerPhone (String)
├── userId (UUID, FK → User, optional) - null for guest purchases
├── ticketCode (String, unique) - human-readable code
├── qrPayload (String, unique) - signed QR data
├── qrImageUrl (String, optional) - QR code image URL
├── status (PENDING | CONFIRMED | CANCELLED | USED)
├── issuedAt (DateTime, optional)
└── usedAt (DateTime, optional)

PaymentLog
├── id (UUID, PK)
├── ticketId (UUID, FK → Ticket, unique, optional)
├── amount (Float)
├── currency (String) - default: "NGN"
├── reference (String, unique) - Paystack reference
├── provider (String) - default: "paystack"
├── status (PENDING | SUCCESS | FAILED | REFUNDED)
├── rawPayload (Json, optional)
├── channel (String, optional)
└── paidAt (DateTime, optional)
```

### Notifications
```
Notification
├── id (UUID, PK)
├── userId (UUID, FK → User, optional) - null for system-wide
├── type (CLASS_REMINDER | TICKET_CONFIRMATION | PAYMENT_SUCCESS | GENERAL | ADMIN_BROADCAST)
├── title (String)
├── body (String)
├── read (Boolean) - default: false
└── meta (Json, optional) - additional data
```

## Frontend Structure

### Existing Pages (Static)
```
dance-class-website-template/
├── index.html          - Landing page
├── about.html          - About page
├── classes.html        - Class listing (static)
├── event.html          - Event listing (static)
├── training.html       - Training programs
├── registration.html   - Registration form (not connected)
├── team.html           - Instructors
├── gallery.html        - Photo gallery
├── testimonial.html    - Testimonials
├── blog.html           - Blog
├── contact.html        - Contact form
└── 404.html            - Error page
```

### Pages to Create
```
NEW PAGES NEEDED:
├── login.html               - Login form (student/admin)
├── student-dashboard.html   - Student dashboard
├── admin-dashboard.html     - Admin dashboard
├── class-detail.html        - Class detail with enrollment
├── my-classes.html          - Enrolled classes list
├── event-detail.html        - Event detail with ticket purchase
├── checkout.html            - Ticket checkout/payment
├── my-tickets.html          - Purchased tickets list
├── ticket-detail.html       - Ticket view with QR code
├── admin-classes.html       - Admin class management
├── admin-events.html        - Admin event management
├── admin-students.html      - Admin student management
├── admin-verify-ticket.html - Ticket verification/scanning
└── profile.html             - User profile edit
```

### JavaScript Modules to Create
```
js/
├── auth.js            - Authentication utilities (login, logout, checkAuth)
├── api-client.js      - Enhanced API client with error handling
├── student.js         - Student-specific functionality
├── admin.js           - Admin-specific functionality
├── classes.js         - Class browsing and enrollment
├── events.js          - Event browsing and ticketing
├── tickets.js         - Ticket display and management
├── payments.js        - Paystack payment integration
└── notifications.js   - Notification handling
```

## User Flows

### Student Registration Flow
```
1. User visits registration.html
2. Fills form (name, email, password, phone, level, etc.)
3. Submit → POST /api/auth/register
4. Backend creates User + StudentProfile
5. Returns JWT token
6. Frontend stores token in localStorage
7. Redirects to student-dashboard.html
```

### Student Login Flow
```
1. User visits login.html
2. Enters email + password
3. Submit → POST /api/auth/login
4. Backend validates credentials
5. Returns JWT token + user info
6. Frontend stores token
7. If role=STUDENT → redirect to student-dashboard.html
8. If role=ADMIN → redirect to admin-dashboard.html
```

### Class Enrollment Flow
```
1. Student browses classes.html (dynamic, fetches from API)
2. Clicks class → class-detail.html?id=<classId>
3. Views details, instructor, schedule, remaining spots
4. Clicks "Enroll" → POST /api/classes/:classId/register
5. Backend checks capacity, creates ClassRegistration
6. Success message + redirect to my-classes.html
```

### Event Ticket Purchase Flow
```
1. User browses event.html (dynamic, fetches from API)
2. Clicks event → event-detail.html?id=<eventId>
3. Views event details, price, availability
4. Clicks "Buy Ticket" → checkout.html?eventId=<eventId>
5. Fills form (name, email, phone)
6. Submit → POST /api/events/:eventId/checkout
7. Backend creates Ticket + PaymentLog (PENDING)
8. Returns Paystack payment URL
9. Redirects to Paystack payment page
10. User completes payment
11. Paystack webhook → POST /api/paystack/webhook
12. Backend updates PaymentLog → SUCCESS
13. Backend updates Ticket → CONFIRMED
14. Backend generates QR code
15. Backend sends email with ticket
16. User redirected to ticket-detail.html?ticketId=<ticketId>
```

### Admin Ticket Verification Flow
```
1. Admin visits admin-verify-ticket.html
2. Scans QR code or enters ticket code
3. Submit → POST /api/tickets/verify
4. Backend validates QR signature
5. Backend checks ticket status
6. If valid → display ticket details + "Mark as Used" button
7. Admin clicks "Mark as Used" → PUT /api/tickets/:ticketId/use
8. Ticket status → USED, usedAt → now
9. Success message
```

## Security Considerations

### Authentication
- ✅ Passwords hashed with bcryptjs (12 rounds)
- ✅ JWT tokens expire after 7 days
- ✅ Rate limiting on auth endpoints (5 requests per 15 minutes)
- ✅ Email verification (optional - token sent to email)

### Authorization
- ✅ Role-based access control (STUDENT, ADMIN)
- ✅ Middleware checks JWT and role for protected routes
- ✅ Students can only access their own data
- ✅ Admins can access all data

### API Security
- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Input validation with Zod schemas
- ✅ SQL injection protection (Prisma ORM)
- ✅ Paystack webhook signature verification

### Frontend Security
- ⚠️ JWT stored in localStorage (vulnerable to XSS)
- TODO: Consider httpOnly cookies for better security
- TODO: Implement CSRF protection for state-changing operations
- TODO: Sanitize user inputs to prevent XSS

## Payment Integration (Paystack)

### Configuration
- **Provider**: Paystack (Nigerian payment gateway)
- **Currency**: NGN (Nigerian Naira)
- **Environment**: Configured via `PAYSTACK_SECRET_KEY` env variable

### Flow
```
1. User initiates checkout → POST /api/events/:eventId/checkout
2. Backend creates Ticket + PaymentLog (status: PENDING)
3. Backend generates Paystack payment URL
4. Frontend redirects to Paystack hosted page
5. User completes payment on Paystack
6. Paystack sends webhook → POST /api/paystack/webhook
7. Backend verifies webhook signature
8. Backend updates PaymentLog (status: SUCCESS, paidAt: now)
9. Backend updates Ticket (status: CONFIRMED, issuedAt: now)
10. Backend generates QR code for ticket
11. Backend sends email with ticket details
12. Paystack redirects user back to success page
```

### Webhook Verification
- Paystack sends `x-paystack-signature` header
- Backend computes HMAC SHA512 hash of payload with secret key
- Compares hash with signature
- Only processes webhook if signatures match

## Email Notifications

### Types
1. **Registration Welcome**: Sent after user registers
2. **Email Verification**: Sent with verification link
3. **Ticket Confirmation**: Sent after successful payment with QR code
4. **Class Reminders**: Sent before classes (admin can trigger)
5. **Payment Success**: Sent after payment confirmation

### Configuration
- **Service**: Nodemailer with SMTP
- **From Address**: Configured via `EMAIL_FROM` env variable
- **SMTP Settings**: Configured via env variables (host, port, user, pass)

## QR Code System

### Ticket QR Codes
- **Format**: Signed JSON payload
- **Payload**: `{ ticketId, eventId, buyerEmail, timestamp }`
- **Signature**: HMAC SHA256 with `JWT_SECRET`
- **Verification**: Admin scans QR → backend verifies signature → checks ticket status

### QR Code Generation
- Library: `qrcode` npm package
- Generated when ticket status → CONFIRMED
- Stored as data URL in `qrImageUrl` field
- Included in email and displayed on ticket detail page

## Environment Variables

### Backend (.env)
```
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dance_class_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx

# Email
EMAIL_FROM=noreply@danceclass.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

## Development Workflow

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npx prisma migrate dev
npx prisma generate
npm run dev
```

### Frontend Setup
```bash
cd dance-class-website-template
# Serve with any static server (e.g., live-server, python -m http.server)
# Update js/api-config.js if backend URL changes
```

### Database Migrations
```bash
cd backend
npx prisma migrate dev --name migration_name
npx prisma generate
```

## Next Steps (Implementation Priority)

### Phase 1: Core Authentication & Navigation
1. Create `auth.js` utility module
2. Build `login.html` page
3. Connect `registration.html` to API
4. Update navigation to show/hide based on auth state
5. Implement logout functionality

### Phase 2: Student Features
1. Create `student-dashboard.html`
2. Make `classes.html` dynamic (fetch from API)
3. Create `class-detail.html` with enrollment
4. Create `my-classes.html` to show enrolled classes
5. Make `event.html` dynamic (fetch from API)
6. Create `event-detail.html` with ticket purchase button

### Phase 3: Event Ticketing
1. Create `checkout.html` for ticket purchase
2. Integrate Paystack payment flow
3. Create `my-tickets.html` to show purchased tickets
4. Create `ticket-detail.html` with QR code display
5. Implement ticket email notification

### Phase 4: Admin Dashboard
1. Create `admin-dashboard.html` with statistics
2. Create `admin-classes.html` for class CRUD
3. Create `admin-events.html` for event CRUD
4. Create `admin-students.html` for student management
5. Create `admin-verify-ticket.html` for QR scanning

### Phase 5: Polish & Production Readiness
1. Implement loading states for all API calls
2. Add comprehensive error handling
3. Make all pages mobile-responsive
4. Add form validation and user feedback
5. Implement notifications system UI
6. Test all user flows end-to-end
7. Update README with complete setup guide
8. Create sample data/seed script for testing

## Testing Strategy

### Test Accounts
Create these accounts for testing:
- **Student**: student@test.com / password123
- **Admin**: admin@test.com / adminpass123

### Manual Test Scenarios
1. Student registration → email verification → login
2. Browse classes → view details → enroll → check my classes
3. Browse events → view details → buy ticket → payment → receive email → view QR
4. Admin login → create class → create event → verify ticket
5. Test capacity limits (enroll when class is full)
6. Test payment failure scenarios
7. Test duplicate enrollment prevention

### API Testing
- Use Postman or similar tool
- Test all endpoints with valid/invalid data
- Test authentication/authorization
- Test error responses

## Known Limitations

1. **Frontend Framework**: Plain JavaScript (no React/Vue) limits state management
2. **JWT in localStorage**: Vulnerable to XSS attacks
3. **No Real-time Updates**: WebSockets not implemented
4. **Single Currency**: Only NGN supported
5. **No Refund UI**: Refunds require admin API access
6. **No Multi-ticket Purchase**: Can only buy one ticket at a time
7. **No Class Pass System**: Only individual class enrollment
8. **No Recurring Payments**: No subscription/membership system

## Future Enhancements

- Migrate frontend to React or Vue for better state management
- Implement WebSocket for real-time notifications
- Add multi-ticket purchase in single transaction
- Implement class pass/membership system
- Add instructor portal for attendance marking
- Build mobile app (React Native)
- Add analytics dashboard for admins
- Implement waiting list for full classes
- Add review/rating system for classes and instructors
- Support multiple payment gateways
- Add social media integration (share events)
- Implement calendar integration (Google Calendar, iCal)

---

**Last Updated**: December 10, 2025
