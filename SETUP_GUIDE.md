# Dance Class & Event Ticketing Platform - Complete Setup Guide

This guide will help you get the full-stack dance class and event ticketing platform up and running.

## 🎯 What's Been Implemented

### ✅ Backend (100% Complete)
- **Express.js + TypeScript** REST API
- **PostgreSQL** database with Prisma ORM
- **JWT authentication** with role-based access control
- **All API endpoints** for classes, events, tickets, users
- **Payment integration** (Paystack ready)
- **Email notifications** system
- **Database seeding** script with sample data

### ✅ Frontend (Core Features Complete)
- **Authentication System**
  - Login page with role-based redirect
  - Registration page with full validation
  - Dynamic navigation based on user role

- **Student Features**
  - Student dashboard with enrolled classes and tickets
  - Classes browsing page with filters (level, day, style)
  - Class detail page with enrollment functionality
  - Events browsing page
  - Event detail page with ticket information

- **Shared Utilities**
  - API client with authentication
  - Loading states and error handling
  - Message notifications
  - Date/time formatting helpers

### 🚧 Admin Features (Basic Structure Exists)
- Admin dashboard HTML exists but needs JavaScript wiring
- Admin management pages (classes, events, students, ticket verification) are HTML templates ready for implementation

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18 or higher
- **PostgreSQL** database
- **npm** or **yarn**

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies (already done)
npm install

# Database is already set up with:
# - Database: dance_class_db
# - User: danceuser
# - Password: dancepass123

# Migrations are already applied
# Database is already seeded with sample data
```

**Backend is currently running at:** `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd ../dance-class-website-template

# Start a local web server
# Option 1: Python
python3 -m http.server 8000

# Option 2: Node.js http-server
npx http-server -p 8000

# Option 3: PHP
php -S localhost:8000
```

**Frontend will be available at:** `http://localhost:8000`

## 👥 Test Accounts

### Student Account
- **Email:** `student@test.com`
- **Password:** `student123`
- **Access:** Browse classes, enroll, view events, purchase tickets

### Admin Account
- **Email:** `admin@test.com`
- **Password:** `admin123`
- **Access:** Full admin capabilities (when admin pages are wired up)

## 📊 Sample Data Included

### Classes (5 Total)
1. **Hip Hop Basics** - Monday, 6:00 PM, Beginner, ₦15,000
2. **Contemporary Dance** - Wednesday, 7:00 PM, Intermediate, ₦18,000
3. **Ballet Fundamentals** - Tuesday, 5:00 PM, Beginner, ₦20,000
4. **Afrobeat Dance** - Friday, 6:30 PM, Beginner, ₦12,000
5. **Jazz Dance Advanced** - Thursday, 7:30 PM, Advanced, ₦22,000

### Events (4 Total)
1. **Annual Dance Showcase 2025** - Feb 15, 2025, ₦5,000
2. **Hip Hop Battle Championship** - Mar 1, 2025, ₦3,000
3. **Afrobeat Workshop** - Feb 22, 2025, ₦8,000
4. **Ballet Recital** - Mar 20, 2025, ₦4,000

## 🧪 Testing the Application

### Test Student Flow

1. **Open Frontend:** `http://localhost:8000`

2. **Register a New Student:**
   - Click "Register Now"
   - Fill out the registration form
   - Submit and you'll be auto-logged in

3. **Browse Classes:**
   - Click "Classes" in navigation
   - Use filters to find classes by level, day, or style
   - Click "View Details" on any class

4. **Enroll in a Class:**
   - On class detail page, click "Enroll in Class"
   - Success message will appear
   - Class will appear in your dashboard

5. **View Your Dashboard:**
   - Click "My Account" → "Dashboard"
   - See your enrolled classes
   - See your tickets (if any)

6. **Browse Events:**
   - Click "Events" in navigation
   - View upcoming dance events
   - Click "View Details" to see event information

7. **View Event Details:**
   - See event date, time, venue, price
   - See available tickets
   - Click "Buy Ticket" (will prompt login if not authenticated)

### Test Admin Flow

1. **Login as Admin:**
   - Go to `/login.html`
   - Email: `admin@test.com`
   - Password: `admin123`
   - You'll be redirected to admin dashboard

2. **Admin Dashboard:**
   - The HTML exists at `/admin-dashboard.html`
   - Needs JavaScript implementation to fetch statistics

## 📁 Project Structure

```
dance-class-web/
├── backend/                          # Express.js backend
│   ├── src/
│   │   ├── config/                   # DB and app configuration
│   │   ├── controllers/              # Request handlers
│   │   ├── middleware/               # Auth, validation, errors
│   │   ├── routes/                   # API routes
│   │   ├── services/                 # Business logic
│   │   └── utils/                    # Helper functions
│   ├── prisma/                       # Database schema
│   ├── seed.js                       # Database seeding script
│   └── .env                          # Environment variables
│
└── dance-class-website-template/     # Frontend
    ├── js/
    │   ├── api-config.js             # API endpoints and helpers
    │   ├── auth.js                   # Authentication utilities
    │   ├── navigation.js             # Dynamic navigation
    │   ├── utils.js                  # Helper functions
    │   ├── classes.js                # Classes page logic
    │   └── events.js                 # Events page logic
    │
    ├── index.html                    # Landing page
    ├── login.html                    # ✅ Login page (wired)
    ├── registration.html             # ✅ Registration (wired)
    │
    ├── classes.html                  # ✅ Browse classes (wired)
    ├── class-detail.html             # ✅ Class details (wired)
    ├── event.html                    # ✅ Browse events (wired)
    ├── event-detail.html             # ✅ Event details (wired)
    │
    ├── student-dashboard.html        # ✅ Student dashboard (wired)
    ├── my-classes.html               # ⚠️ Needs wiring
    ├── my-tickets.html               # ⚠️ Needs wiring
    ├── checkout.html                 # ⚠️ Needs Paystack integration
    ├── ticket-detail.html            # ⚠️ Needs wiring
    │
    ├── admin-dashboard.html          # ⚠️ HTML exists, needs JS
    ├── admin-classes.html            # ⚠️ HTML exists, needs JS
    ├── admin-events.html             # ⚠️ HTML exists, needs JS
    ├── admin-students.html           # ⚠️ HTML exists, needs JS
    └── admin-verify-ticket.html      # ⚠️ HTML exists, needs JS
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Classes
- `GET /api/classes` - List all classes
- `GET /api/classes/:id` - Get class details
- `POST /api/classes/:id/register` - Enroll in class (Student)
- `GET /api/classes/student/my-classes` - Get enrolled classes (Student)

### Events
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event details
- `POST /api/events/:id/checkout` - Purchase ticket

### Tickets
- `GET /api/tickets/user/my-tickets` - Get user's tickets
- `GET /api/tickets/:id` - Get ticket details
- `POST /api/tickets/verify` - Verify ticket (Admin)

### Admin Endpoints
- `GET /api/users` - Get all students (Admin)
- `POST /api/classes` - Create class (Admin)
- `PUT /api/classes/:id` - Update class (Admin)
- `POST /api/events` - Create event (Admin)
- `PUT /api/events/:id` - Update event (Admin)

## 🛠 What Still Needs Implementation

### High Priority
1. **Checkout Page** - Paystack payment integration for ticket purchases
2. **My Classes Page** - Display and manage enrolled classes
3. **My Tickets Page** - Display purchased tickets with QR codes
4. **Ticket Detail Page** - Show ticket with QR code

### Medium Priority
5. **Admin Dashboard** - Wire up statistics and data fetching
6. **Admin Class Management** - CRUD operations for classes
7. **Admin Event Management** - CRUD operations for events
8. **Admin Student Management** - View and manage students
9. **Admin Ticket Verification** - QR code scanning and validation

### Low Priority (Enhancement)
- Email verification flow
- Password reset functionality
- Profile editing
- Attendance tracking
- Class reminders
- Payment history

## 🔧 Troubleshooting

### Backend Not Starting
```bash
# Check PostgreSQL is running
sudo service postgresql status

# If not running
sudo service postgresql start

# Check if port 5000 is available
lsof -i :5000

# Regenerate Prisma client if needed
npx prisma generate
```

### Frontend Not Loading Data
1. Verify backend is running: `curl http://localhost:5000/api/health`
2. Check browser console for errors
3. Verify API_BASE_URL in `js/api-config.js`

### Database Issues
```bash
# Reset database (WARNING: Deletes all data)
cd backend
npx prisma migrate reset

# Reseed database
node seed.js
```

## 📝 Environment Variables

The `.env` file in the backend directory contains:

```env
# Database
DATABASE_URL="postgresql://danceuser:dancepass123@localhost:5432/dance_class_db"

# JWT
JWT_SECRET="dev-secret-key-change-in-production-12345678"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"

# Paystack (placeholder keys)
PAYSTACK_SECRET_KEY="sk_test_placeholder"
PAYSTACK_PUBLIC_KEY="pk_test_placeholder"

# Email (optional for dev)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="test@example.com"
SMTP_PASS="placeholder"
EMAIL_FROM="noreply@danceschool.com"

# Frontend
FRONTEND_URL="http://localhost:3000"
```

## 🎨 Customization

### Branding
- Update logo in navigation (`index.html`, `login.html`, etc.)
- Modify color scheme in `css/style.css`
- Change contact information in footer

### Payment Gateway
- Get Paystack API keys from https://paystack.com
- Update `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY` in `.env`
- Implement checkout flow in `checkout.html`

## 🚀 Deployment Notes

### Backend Deployment
- Use environment variables for sensitive data
- Set `NODE_ENV=production`
- Use process manager like PM2
- Set up reverse proxy (Nginx)
- Enable HTTPS

### Frontend Deployment
- Can be hosted on any static hosting (Netlify, Vercel, GitHub Pages)
- Update `API_BASE_URL` in `js/api-config.js` to production API URL
- Optimize assets (minify JS/CSS, compress images)

### Database
- Use managed PostgreSQL service (AWS RDS, Heroku Postgres, etc.)
- Regular backups
- Connection pooling

## 📚 Additional Resources

- **Backend Documentation:** `backend/API_DOCUMENTATION.md`
- **Architecture:** `ARCHITECTURE.md`
- **Deployment Guide:** `backend/DEPLOYMENT.md`
- **Prisma Schema:** `backend/prisma/schema.prisma`

## 🙋 Getting Help

For issues or questions:
1. Check the troubleshooting section above
2. Review the architecture documentation
3. Check browser console for frontend errors
4. Check backend logs for API errors

---

**Status:** Core student features complete and functional. Admin features have HTML templates ready for JavaScript implementation.

**Last Updated:** December 17, 2025
