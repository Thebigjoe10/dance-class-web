# Dance Class & Event Ticketing Web Application

A full-stack web application for managing dance classes, events, and ticketing built with Express.js (backend) and vanilla JavaScript with Bootstrap 5 (frontend).

## 🎯 Features

### For Students
- ✅ User registration and authentication
- ✅ Browse and filter dance classes by level, style, and schedule
- ✅ Enroll in dance classes
- ✅ View upcoming events and purchase tickets
- ✅ Secure payment processing via Paystack
- ✅ Digital tickets with QR codes
- ✅ Personal dashboard with enrolled classes and tickets
- ✅ Track class attendance

### For Administrators
- ✅ Complete class management (CRUD operations)
- ✅ Event management with capacity tracking
- ✅ Student management and level assignments
- ✅ Ticket verification system with QR code scanning
- ✅ Dashboard with real-time statistics
- ✅ Recent registrations tracking

### Technical Features
- ✅ JWT-based authentication
- ✅ Role-based access control (Student/Admin)
- ✅ RESTful API architecture
- ✅ PostgreSQL database with Prisma ORM
- ✅ Email notifications
- ✅ QR code generation for tickets
- ✅ Payment webhook integration
- ✅ Mobile-responsive design

## 📁 Project Structure

```
dance-class-web/
├── backend/                          # Express.js backend
│   ├── src/
│   │   ├── config/                   # Configuration files
│   │   ├── controllers/              # Request handlers
│   │   ├── middleware/               # Auth, validation, error handling
│   │   ├── routes/                   # API routes
│   │   ├── services/                 # Business logic
│   │   ├── utils/                    # Helper functions
│   │   ├── app.ts                    # Express app setup
│   │   └── server.ts                 # Server entry point
│   ├── prisma/                       # Database schema & migrations
│   │   └── schema.prisma             # Prisma schema
│   ├── tests/                        # Test files
│   ├── .env.example                  # Environment variables template
│   └── package.json                  # Node.js dependencies
│
└── dance-class-website-template/     # Frontend (static HTML/CSS/JS)
    ├── css/                          # Stylesheets
    ├── js/                           # JavaScript files
    │   ├── auth.js                   # Authentication utilities
    │   ├── api-config.js             # API configuration
    │   ├── navigation.js             # Dynamic navigation
    │   └── main.js                   # Main JS file
    ├── lib/                          # Third-party libraries
    ├── img/                          # Images
    │
    ├── index.html                    # Landing page
    ├── login.html                    # Login page
    ├── registration.html             # Registration page
    │
    ├── classes.html                  # Browse classes
    ├── class-detail.html             # Class details & enrollment
    ├── event.html                    # Browse events
    ├── event-detail.html             # Event details
    ├── checkout.html                 # Ticket purchase
    ├── ticket-detail.html            # Ticket with QR code
    │
    ├── student-dashboard.html        # Student dashboard
    ├── my-classes.html               # Student's enrolled classes
    ├── my-tickets.html               # Student's tickets
    │
    ├── admin-dashboard.html          # Admin dashboard
    ├── admin-classes.html            # Manage classes
    ├── admin-events.html             # Manage events
    ├── admin-students.html           # Manage students
    └── admin-verify-ticket.html      # Verify tickets at events
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- PostgreSQL database
- npm or yarn package manager
- (Optional) Paystack account for payment processing

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file with your configuration:**
   ```env
   # Server
   NODE_ENV=development
   PORT=5000

   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/dance_class_db

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # Paystack (for payment processing)
   PAYSTACK_SECRET_KEY=sk_test_xxxxx
   PAYSTACK_PUBLIC_KEY=pk_test_xxxxx

   # Email (optional, for notifications)
   EMAIL_FROM=noreply@danceclass.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password

   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

5. **Set up the database:**
   ```bash
   # Run migrations
   npx prisma migrate dev

   # Generate Prisma client
   npx prisma generate
   ```

6. **Start the backend server:**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

   Backend should now be running at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd dance-class-website-template
   ```

2. **Update API base URL (if needed):**

   Edit `js/api-config.js` and ensure the API_BASE_URL points to your backend:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```

3. **Serve the frontend:**

   You can use any static file server. Here are a few options:

   **Option 1: Using Python**
   ```bash
   python3 -m http.server 3000
   ```

   **Option 2: Using Node.js http-server**
   ```bash
   npx http-server -p 3000
   ```

   **Option 3: Using Live Server (VS Code extension)**
   - Install "Live Server" extension
   - Right-click on `index.html` → "Open with Live Server"

   Frontend should now be running at `http://localhost:3000`

### Database Seeding (Optional)

To create test data for development:

1. **Create an admin account:**
   ```bash
   cd backend
   npm run seed:admin
   ```

   Or manually via API:
   ```bash
   curl -X POST http://localhost:5000/api/auth/admin \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Admin User",
       "email": "admin@test.com",
       "password": "adminpass123",
       "phone": "+1234567890"
     }'
   ```

2. **Create a test student:**
   Visit `http://localhost:3000/registration.html` and register a new student account.

## 📖 Usage Guide

### For Students

1. **Registration:**
   - Visit `/registration.html`
   - Fill in your information
   - Select your dance experience level
   - Submit to create account

2. **Login:**
   - Visit `/login.html`
   - Enter email and password
   - You'll be redirected to your dashboard

3. **Browse Classes:**
   - Visit `/classes.html`
   - Filter by level, day, or style
   - Click on a class to view details

4. **Enroll in Class:**
   - On class detail page, click "Enroll in Class"
   - Class will appear in your dashboard

5. **Purchase Event Tickets:**
   - Visit `/event.html`
   - Click on an event to view details
   - Click "Buy Ticket"
   - Fill in information and complete payment
   - Receive ticket with QR code

6. **View Your Dashboard:**
   - Access at `/student-dashboard.html`
   - See enrolled classes and purchased tickets
   - Quick access to all your activities

### For Administrators

1. **Admin Login:**
   - Visit `/login.html`
   - Login with admin credentials
   - You'll be redirected to admin dashboard

2. **Manage Classes:**
   - Visit `/admin-classes.html`
   - Add new classes with schedule and capacity
   - Edit existing classes
   - View enrollment and attendees

3. **Manage Events:**
   - Visit `/admin-events.html`
   - Create new events with ticket pricing
   - Edit event details
   - Monitor ticket sales

4. **Manage Students:**
   - Visit `/admin-students.html`
   - View all registered students
   - Update student levels
   - View student enrollments

5. **Verify Tickets:**
   - Visit `/admin-verify-ticket.html`
   - Enter ticket code or scan QR
   - Verify ticket validity
   - Mark tickets as used at event entrance

## 🔐 Authentication & Security

### JWT Authentication
- Tokens stored in `localStorage` (client-side)
- Token expiry: 7 days (configurable)
- Automatic token inclusion in API requests

### Password Security
- Passwords hashed using bcryptjs (12 rounds)
- Minimum 8 characters required
- Password confirmation on registration

### Role-Based Access Control
- **STUDENT**: Access to classes, events, personal dashboard
- **ADMIN**: Access to all management features

### API Security
- Helmet.js for security headers
- CORS configuration
- Rate limiting on auth endpoints
- Input validation with Zod schemas
- SQL injection protection via Prisma ORM

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register      - Register new student
POST   /api/auth/login         - Login user
GET    /api/auth/verify/:token - Verify email
GET    /api/auth/me            - Get current user
POST   /api/auth/admin         - Create admin (Admin only)
```

### Classes
```
GET    /api/classes                      - List all classes
GET    /api/classes/:id                  - Get class details
POST   /api/classes                      - Create class (Admin)
PUT    /api/classes/:id                  - Update class (Admin)
DELETE /api/classes/:id                  - Delete class (Admin)
POST   /api/classes/:id/register         - Enroll in class (Student)
DELETE /api/classes/:id/register         - Unenroll from class (Student)
GET    /api/classes/student/my-classes   - Get enrolled classes (Student)
```

### Events
```
GET    /api/events                 - List all events
GET    /api/events/:id             - Get event details
POST   /api/events/:id/checkout    - Purchase ticket
POST   /api/events                 - Create event (Admin)
PUT    /api/events/:id             - Update event (Admin)
DELETE /api/events/:id             - Delete event (Admin)
```

### Tickets
```
GET    /api/tickets/:id                - Get ticket details
GET    /api/tickets/user/my-tickets    - Get user tickets
POST   /api/tickets/verify             - Verify ticket (Admin)
PUT    /api/tickets/:id/use            - Mark ticket as used (Admin)
```

### Users
```
GET    /api/users                  - Get all students (Admin)
GET    /api/users/:id              - Get student details (Admin)
PUT    /api/users/:id/level        - Update student level (Admin)
DELETE /api/users/:id              - Delete student (Admin)
```

## 🧪 Testing

### Manual Testing

**Test Student Flow:**
1. Register new student account
2. Login with student credentials
3. Browse and enroll in a class
4. Browse events and purchase a ticket
5. View dashboard to see enrollments and tickets
6. View ticket detail with QR code

**Test Admin Flow:**
1. Login with admin credentials
2. Create a new class
3. Create a new event
4. View registered students
5. Verify a ticket code
6. View dashboard statistics

### Test Accounts

Create these accounts for testing:

**Student Account:**
- Email: `student@test.com`
- Password: `password123`

**Admin Account:**
- Email: `admin@test.com`
- Password: `adminpass123`

### API Testing

Use Postman or curl to test API endpoints:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test student registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "test@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "level": "BEGINNER"
  }'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🎨 Customization

### Branding
- Update logo in navigation (replace "SOP" with your brand)
- Modify color scheme in `css/style.css`
- Update contact information in topbar and footer

### Email Templates
- Email templates are in `backend/src/utils/email.ts`
- Customize welcome emails, ticket confirmations, reminders

### Payment Gateway
- Currently configured for Paystack (Nigerian payments)
- To use different gateway, modify checkout flow in:
  - `backend/src/controllers/eventController.ts`
  - `dance-class-website-template/checkout.html`

## 🐛 Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Run `npx prisma generate`
- Check port 5000 is not in use

### Frontend can't connect to API
- Verify backend is running at `http://localhost:5000`
- Check `js/api-config.js` has correct API_BASE_URL
- Check browser console for CORS errors

### Login not working
- Clear browser localStorage
- Verify JWT_SECRET is set in backend `.env`
- Check backend logs for authentication errors

### Payments not working
- Verify Paystack keys in `.env`
- Check webhook is configured in Paystack dashboard
- Test with Paystack test card numbers

## 📚 Additional Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture documentation
- [Backend API Documentation](./backend/README.md) - API details
- [Prisma Schema](./backend/prisma/schema.prisma) - Database models

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Bootstrap 5 for UI framework
- Font Awesome for icons
- Prisma for database ORM
- Paystack for payment processing

## 📧 Contact

For questions or support, please contact:
- Email: info@danceclass.com
- Website: https://danceclass.com

---

**Built with ❤️ for the dance community**
