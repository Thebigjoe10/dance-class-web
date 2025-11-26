# Dance School API - Complete Documentation

Base URL: `https://api.danceschool.com/api`

## Authentication

Most endpoints require JWT authentication. Include the token in the request header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens are obtained from `/auth/login` or `/auth/register` endpoints.

---

## Response Format

All responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Optional message",
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Endpoints

### Authentication

#### POST /auth/register

Register a new student account.

**Request:**
```json
{
  "email": "student@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "phone": "+2348012345678"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "name": "John Doe",
      "role": "STUDENT",
      "verified": false
    },
    "token": "jwt-token"
  }
}
```

---

#### POST /auth/login

Login with email and password.

**Request:**
```json
{
  "email": "student@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "name": "John Doe",
      "role": "STUDENT",
      "verified": true,
      "level": "BEGINNER"
    },
    "token": "jwt-token"
  }
}
```

---

#### GET /auth/verify/:token

Verify email address using token from email.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "verified": true
    }
  }
}
```

---

### Events & Ticketing

#### GET /events

List all events with availability.

**Query Parameters:**
- `isActive` (boolean) - Filter by active status
- `upcoming` (boolean) - Filter upcoming events

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Annual Dance Showcase",
      "description": "End of year performance",
      "date": "2024-12-20T00:00:00.000Z",
      "time": "18:00",
      "venue": "Grand Theater",
      "capacity": 200,
      "price": 5000,
      "imageUrl": "https://example.com/image.jpg",
      "isActive": true,
      "soldTickets": 45,
      "availableTickets": 155
    }
  ],
  "count": 1
}
```

---

#### POST /events/:eventId/checkout

Purchase ticket for an event (guest or authenticated user).

**Headers:**
- `Authorization: Bearer <token>` (optional - for logged-in users)

**Request:**
```json
{
  "buyerName": "Jane Smith",
  "buyerEmail": "jane@example.com",
  "buyerPhone": "+2348087654321"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Checkout initiated. Please complete payment.",
  "data": {
    "ticket": {
      "id": "ticket-uuid",
      "code": "A1B2C3D4E5F6"
    },
    "payment": {
      "authorizationUrl": "https://checkout.paystack.com/abc123",
      "reference": "TKT-ticket-uuid-1234567890"
    }
  }
}
```

**Flow:**
1. Call this endpoint to create ticket and initialize payment
2. Redirect user to `payment.authorizationUrl`
3. User completes payment on Paystack
4. Paystack calls webhook to confirm payment
5. Ticket is confirmed and emailed to buyer

---

#### GET /tickets/:ticketId

Get ticket details and QR code.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "ticket-uuid",
    "ticketCode": "A1B2C3D4E5F6",
    "qrPayload": "base64-encoded-qr-data",
    "qrImageUrl": "data:image/png;base64,...",
    "status": "CONFIRMED",
    "buyerName": "Jane Smith",
    "buyerEmail": "jane@example.com",
    "buyerPhone": "+2348087654321",
    "issuedAt": "2024-01-15T10:30:00.000Z",
    "event": {
      "title": "Annual Dance Showcase",
      "date": "2024-12-20T00:00:00.000Z",
      "time": "18:00",
      "venue": "Grand Theater"
    }
  }
}
```

---

#### POST /tickets/verify

Verify ticket QR code (admin/staff use at event entrance).

**Auth Required:** Admin

**Request:**
```json
{
  "qrPayload": "base64-encoded-qr-data"
}
```

**Response (Valid):** `200 OK`
```json
{
  "success": true,
  "message": "Ticket is valid",
  "valid": true,
  "data": {
    "ticket": {
      "id": "ticket-uuid",
      "code": "A1B2C3D4E5F6",
      "buyerName": "Jane Smith",
      "event": {
        "title": "Annual Dance Showcase",
        "date": "2024-12-20T00:00:00.000Z",
        "time": "18:00",
        "venue": "Grand Theater"
      }
    }
  }
}
```

**Response (Invalid):** `400 Bad Request`
```json
{
  "success": false,
  "message": "Ticket has already been used",
  "valid": false
}
```

---

#### PUT /tickets/:ticketId/use

Mark ticket as used after verification (prevents re-entry).

**Auth Required:** Admin

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Ticket marked as used",
  "data": {
    "id": "ticket-uuid",
    "status": "USED",
    "usedAt": "2024-12-20T18:05:00.000Z"
  }
}
```

---

### Classes

#### GET /classes

List all classes.

**Query Parameters:**
- `level` - Filter by level (BEGINNER, INTERMEDIATE, ADVANCED, PROFESSIONAL)
- `isActive` - Filter by active status
- `dayOfWeek` - Filter by day (0=Sunday, 6=Saturday)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "class-uuid",
      "name": "Hip Hop Basics",
      "style": "Hip Hop",
      "level": "BEGINNER",
      "instructor": "Mike Johnson",
      "description": "Learn fundamental hip hop moves",
      "dayOfWeek": 2,
      "startTime": "17:00",
      "endTime": "18:30",
      "duration": 90,
      "capacity": 20,
      "price": 15000,
      "isActive": true,
      "enrolledCount": 12,
      "availableSpots": 8
    }
  ],
  "count": 1
}
```

---

#### POST /classes/:classId/register

Register for a class (student only).

**Auth Required:** Student

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Successfully registered for class",
  "data": {
    "id": "registration-uuid",
    "status": "ACTIVE",
    "class": {
      "name": "Hip Hop Basics",
      "instructor": "Mike Johnson",
      "dayOfWeek": 2,
      "startTime": "17:00"
    }
  }
}
```

---

#### GET /classes/student/my-classes

Get all classes the authenticated student is registered for.

**Auth Required:** Student

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "registration-uuid",
      "status": "ACTIVE",
      "class": {
        "id": "class-uuid",
        "name": "Hip Hop Basics",
        "style": "Hip Hop",
        "level": "BEGINNER",
        "instructor": "Mike Johnson",
        "dayOfWeek": 2,
        "startTime": "17:00",
        "endTime": "18:30"
      }
    }
  ],
  "count": 1
}
```

---

### Payments

#### POST /paystack/webhook

Webhook endpoint for Paystack payment notifications.

**Headers:**
- `x-paystack-signature` - Webhook signature for verification

**Request:** (Paystack sends this)
```json
{
  "event": "charge.success",
  "data": {
    "reference": "TKT-ticket-uuid-1234567890",
    "amount": 500000,
    "currency": "NGN",
    "status": "success",
    "paid_at": "2024-01-15T10:30:00.000Z",
    "channel": "card"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Webhook processed"
}
```

**What happens:**
1. Paystack calls this webhook after payment
2. Backend verifies signature
3. Updates payment log status
4. Confirms ticket
5. Sends ticket email to buyer

---

#### GET /payments/verify/:reference

Verify payment status (can be called from frontend after payment).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "status": "success",
    "amount": 5000,
    "currency": "NGN",
    "reference": "TKT-ticket-uuid-1234567890",
    "paidAt": "2024-01-15T10:30:00.000Z",
    "channel": "card"
  }
}
```

---

### Notifications

#### GET /notifications

Get user's notifications.

**Auth Required:** Yes

**Query Parameters:**
- `read` (boolean) - Filter by read status

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "notification-uuid",
      "type": "TICKET_CONFIRMATION",
      "title": "Ticket Confirmed",
      "body": "Your ticket for Annual Dance Showcase has been confirmed",
      "read": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "meta": {
        "ticketId": "ticket-uuid",
        "eventId": "event-uuid"
      }
    }
  ],
  "count": 1
}
```

---

#### GET /notifications/unread-count

Get count of unread notifications.

**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "count": 3
  }
}
```

---

#### PUT /notifications/:notificationId/read

Mark notification as read.

**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": "notification-uuid",
    "read": true
  }
}
```

---

### Admin Endpoints

#### POST /admin/events

Create new event.

**Auth Required:** Admin

**Request:**
```json
{
  "title": "Summer Dance Festival",
  "description": "Outdoor dance festival",
  "date": "2024-07-15",
  "time": "14:00",
  "venue": "City Park",
  "capacity": 500,
  "price": 8000,
  "imageUrl": "https://example.com/festival.jpg"
}
```

**Response:** `201 Created`

---

#### POST /admin/classes

Create recurring weekly class.

**Auth Required:** Admin

**Request:**
```json
{
  "name": "Advanced Ballet",
  "style": "Ballet",
  "level": "ADVANCED",
  "instructor": "Sarah Williams",
  "description": "Advanced techniques",
  "dayOfWeek": 3,
  "startTime": "18:00",
  "endTime": "19:30",
  "duration": 90,
  "capacity": 15,
  "price": 20000,
  "startDate": "2024-02-01",
  "endDate": "2024-06-30"
}
```

**Response:** `201 Created`

---

#### POST /notifications/broadcast

Send notification to multiple users.

**Auth Required:** Admin

**Request:**
```json
{
  "title": "Studio Closure Notice",
  "body": "Studio will be closed next Monday for maintenance",
  "type": "ADMIN_BROADCAST",
  "sendToAll": true,
  "sendEmail": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Broadcast sent to 150 users",
  "data": {
    "count": 150
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/auth/register`, `/auth/login` | 5 requests per 15 minutes |
| `/events/:id/checkout` | 3 requests per minute |
| `/tickets/verify` | 10 requests per minute |
| General endpoints | 100 requests per 15 minutes |

---

## Testing

Use these test credentials in development:

**Student Account:**
- Email: `student@test.com`
- Password: `TestPass123`

**Admin Account:**
- Email: `admin@test.com`
- Password: `AdminPass123`

**Test Paystack Cards:**
- Success: `4084084084084081`
- Decline: `4084080000000408`

---

## Postman Collection

Import the `postman_collection.json` file included in this repository for easy API testing.

---

## Support

For API questions or issues:
- Email: api-support@danceschool.com
- Documentation: https://docs.danceschool.com
