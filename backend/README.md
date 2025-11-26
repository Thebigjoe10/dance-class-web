# Dance School Platform - Backend API

A production-ready backend for a Dance School Web App that supports two distinct user flows:
- **Students**: Register/login to enroll in recurring weekly classes and access student dashboards
- **Visitors**: Purchase event tickets with guest checkout (no account required)

## 🚀 Features

### User Management
- JWT-based authentication with secure password hashing
- Role-based access control (Student, Admin)
- Email verification for student accounts
- Student profile management with level assignments

### Class Management
- Recurring weekly class schedules
- Student enrollment and capacity management
- Attendance tracking system
- Level-based class filtering

### Event Ticketing
- **Guest checkout** - visitors can purchase without creating accounts
- Unique QR code generation for each ticket
- Email delivery of tickets with QR codes
- Ticket verification system for event entry
- QR replay protection (mark tickets as used)

### Payment Integration
- Paystack payment gateway integration
- Initialize payment flow
- Webhook handling for payment confirmation
- Payment logging and status tracking
- Refund capabilities

### Notifications
- In-app notifications for students and admins
- Email notifications (ticket confirmations, class reminders)
- Admin broadcast messaging
- Automated class reminder system

## 🛠️ Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcryptjs
- **Payments**: Paystack
- **Email**: Nodemailer
- **QR Codes**: qrcode library
- **Validation**: Zod
- **Testing**: Jest

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn
- Paystack account (for payments)
- SMTP server access (for emails)

## 🔧 Installation

### 1. Clone the repository

```bash
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dance_school?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"

# Paystack
PAYSTACK_SECRET_KEY="sk_test_your_key"
PAYSTACK_PUBLIC_KEY="pk_test_your_key"
PAYSTACK_WEBHOOK_SECRET="your_webhook_secret"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="noreply@danceschool.com"

# Frontend URL
FRONTEND_URL="http://localhost:3000"
```

### 4. Database Setup

Generate Prisma client:

```bash
npm run prisma:generate
```

Run migrations:

```bash
npm run prisma:migrate
```

### 5. Start the Server

**Development mode:**

```bash
npm run dev
```

**Production mode:**

```bash
npm run build
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### API Endpoints

#### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new student account | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/verify/:token` | Verify email address | No |
| GET | `/auth/me` | Get current user info | Yes |
| POST | `/auth/admin` | Create admin user | Yes (Admin) |

#### Users/Students

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/me` | Get my profile | Yes |
| PUT | `/users/me` | Update my profile | Yes |
| GET | `/users` | Get all students | Yes (Admin) |
| GET | `/users/:studentId` | Get student details | Yes (Admin) |
| PUT | `/users/:studentId/level` | Update student level | Yes (Admin) |
| DELETE | `/users/:studentId` | Delete student | Yes (Admin) |

#### Classes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/classes` | List all classes | No |
| GET | `/classes/:classId` | Get class details | No |
| POST | `/classes` | Create new class | Yes (Admin) |
| PUT | `/classes/:classId` | Update class | Yes (Admin) |
| DELETE | `/classes/:classId` | Delete class | Yes (Admin) |
| POST | `/classes/:classId/register` | Register for class | Yes (Student) |
| DELETE | `/classes/:classId/register` | Unregister from class | Yes (Student) |
| GET | `/classes/student/my-classes` | Get my classes | Yes (Student) |
| GET | `/classes/:classId/attendees` | Get class attendees | Yes (Admin) |
| POST | `/classes/:classId/attendance/:studentId` | Mark attendance | Yes (Admin) |
| GET | `/classes/:classId/attendance` | Get attendance records | Yes (Admin) |

#### Events

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/events` | List all events | No |
| GET | `/events/:eventId` | Get event details | No |
| POST | `/events` | Create new event | Yes (Admin) |
| PUT | `/events/:eventId` | Update event | Yes (Admin) |
| DELETE | `/events/:eventId` | Delete event | Yes (Admin) |
| POST | `/events/:eventId/checkout` | Purchase ticket (guest/user) | Optional |
| GET | `/events/:eventId/tickets` | Get event tickets | Yes (Admin) |

#### Tickets

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tickets/:ticketId` | Get ticket details | No |
| GET | `/tickets/user/my-tickets` | Get my tickets | Yes |
| POST | `/tickets/verify` | Verify QR code | Yes (Admin) |
| PUT | `/tickets/:ticketId/use` | Mark ticket as used | Yes (Admin) |
| PUT | `/tickets/:ticketId/cancel` | Cancel ticket | Yes (Admin) |
| POST | `/tickets/user/link` | Link guest tickets to account | Yes |

#### Payments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/paystack/webhook` | Paystack webhook handler | No (Signature) |
| GET | `/payments/verify/:reference` | Verify payment | No |
| GET | `/payments` | Get payment logs | Yes (Admin) |
| GET | `/payments/:paymentId` | Get payment details | Yes (Admin) |
| POST | `/payments/:reference/refund` | Initiate refund | Yes (Admin) |

#### Notifications

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notifications` | Get my notifications | Yes |
| GET | `/notifications/unread-count` | Get unread count | Yes |
| PUT | `/notifications/:notificationId/read` | Mark as read | Yes |
| PUT | `/notifications/mark-all-read` | Mark all as read | Yes |
| DELETE | `/notifications/:notificationId` | Delete notification | Yes |
| POST | `/notifications/broadcast` | Send broadcast | Yes (Admin) |
| POST | `/notifications/class-reminders` | Send class reminders | Yes (Admin) |

### Example Requests

#### 1. Register a Student

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "securePassword123",
    "name": "John Doe",
    "phone": "+2348012345678"
  }'
```

#### 2. Guest Checkout for Event

```bash
curl -X POST http://localhost:5000/api/events/{eventId}/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "buyerName": "Jane Smith",
    "buyerEmail": "jane@example.com",
    "buyerPhone": "+2348087654321"
  }'
```

#### 3. Verify Ticket QR Code

```bash
curl -X POST http://localhost:5000/api/tickets/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "qrPayload": "<base64-qr-payload>"
  }'
```

## 🧪 Testing

Run unit tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

## 🔐 Security Features

- JWT token-based authentication
- Bcrypt password hashing (12 rounds)
- Rate limiting on sensitive endpoints
- Helmet.js security headers
- Input validation with Zod
- CORS configuration
- Webhook signature verification
- QR code signature verification
- SQL injection protection (Prisma ORM)

## 📦 Database Schema

Key models:
- **User** - Students and admins
- **StudentProfile** - Extended student information
- **Class** - Recurring weekly classes
- **ClassRegistration** - Student enrollments
- **Attendance** - Attendance records
- **Event** - One-time events
- **Ticket** - Event tickets (guest or user)
- **PaymentLog** - Payment transactions
- **Notification** - In-app notifications

View full schema in `prisma/schema.prisma`

## 🚀 Deployment

### Using Docker (Recommended)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
RUN npx prisma generate
EXPOSE 5000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t dance-school-api .
docker run -p 5000:5000 --env-file .env dance-school-api
```

### Manual Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Install dependencies: `npm ci --only=production`
4. Build: `npm run build`
5. Generate Prisma client: `npx prisma generate`
6. Run migrations: `npx prisma migrate deploy`
7. Start: `npm start`

### Recommended Platforms

- **Railway** - Automatic deployments with PostgreSQL
- **Render** - Free tier available
- **Heroku** - With Heroku PostgreSQL add-on
- **DigitalOcean App Platform**
- **AWS EC2 + RDS**

## 🔄 Webhook Configuration

### Paystack Webhook Setup

1. Log in to your Paystack dashboard
2. Go to Settings → Webhooks
3. Set webhook URL: `https://yourdomain.com/api/paystack/webhook`
4. Copy webhook secret to `.env` file
5. Test webhook delivery

## 📧 Email Configuration

### Gmail Setup

1. Enable 2-factor authentication
2. Generate app-specific password
3. Use in `SMTP_PASSWORD` env variable

### Other SMTP Providers

- **SendGrid**
- **Mailgun**
- **AWS SES**
- **Postmark**

## 🔍 Monitoring & Logging

- Morgan for HTTP request logging
- Console logs for errors and important events
- Consider integrating:
  - Sentry for error tracking
  - LogRocket for session replay
  - Datadog for APM

## 🤝 Frontend Integration

### API Client Example

```typescript
// api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### Guest Checkout Flow

```typescript
// Visitor buys ticket without account
const response = await apiClient.post(`/events/${eventId}/checkout`, {
  buyerName: "John Doe",
  buyerEmail: "john@example.com",
  buyerPhone: "+2348012345678"
});

// Redirect to Paystack payment page
window.location.href = response.data.data.payment.authorizationUrl;
```

### Payment Callback

```typescript
// After payment, Paystack redirects to callback URL
// Verify payment on backend
const response = await apiClient.get(`/payments/verify/${reference}`);

if (response.data.data.status === 'success') {
  // Ticket confirmed via webhook
  // Show success message and download ticket link
}
```

## 📝 License

MIT License

## 🆘 Support

For issues or questions:
- Create an issue in the repository
- Email: support@danceschool.com

## 🎯 Roadmap

- [ ] SMS notifications via Twilio
- [ ] Multiple ticket purchase
- [ ] Discount codes and promotions
- [ ] Class packages and subscriptions
- [ ] Mobile app API support
- [ ] Analytics dashboard
- [ ] Export reports (CSV, PDF)
