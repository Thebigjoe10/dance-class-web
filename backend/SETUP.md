# Dance School Backend - Setup Instructions

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

A `.env` file has been created with default values. **IMPORTANT:** Update the following values before running:

#### Database Configuration
```env
DATABASE_URL="postgresql://username:password@localhost:5432/dance_school?schema=public"
```
Replace `username` and `password` with your PostgreSQL credentials.

#### JWT Secret
```env
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-make-it-at-least-32-chars"
```
Generate a secure random string (at least 32 characters) for production.

#### Paystack Configuration
Get your API keys from [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developers):
```env
PAYSTACK_SECRET_KEY="sk_test_your_paystack_secret_key"
PAYSTACK_PUBLIC_KEY="pk_test_your_paystack_public_key"
PAYSTACK_WEBHOOK_SECRET="your_webhook_secret"
```

#### Email Configuration
Configure your SMTP settings (example using Gmail):
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"  # Generate an app password in Gmail settings
EMAIL_FROM="noreply@danceschool.com"
```

### 3. Database Setup

Ensure your PostgreSQL database is running, then:

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view/edit data
npm run prisma:studio
```

### 4. Start the Server

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm run build
npm start
```

## Common Issues

### Prisma Engine Download Issues

If you encounter errors like:
```
PrismaClientConstructorValidationError: Using engine type "client" requires either "adapter" or "accelerateUrl"
```

This has been fixed by:
1. Adding `url = env("DATABASE_URL")` to the Prisma schema datasource block
2. Setting `engineType = "library"` in the Prisma generator

If you still have issues generating the Prisma client, try:

```bash
# Clear Prisma cache
npx prisma generate --force

# Or delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run prisma:generate
```

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Verify your DATABASE_URL credentials are correct
3. Create the database if it doesn't exist:
   ```sql
   CREATE DATABASE dance_school;
   ```

## API Endpoints

Once running, the API will be available at:
- Base URL: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/api/health`
- API Documentation: See routes in `src/routes/index.ts`

### Available Routes

- `/api/auth` - Authentication (register, login, verify)
- `/api/users` - User management
- `/api/classes` - Class management and registration
- `/api/events` - Event management
- `/api/tickets` - Ticket purchasing and verification
- `/api/payments` - Payment processing (Paystack)
- `/api/notifications` - User notifications

## Frontend Integration

The frontend can connect to this backend using the configuration file created at:
`../dance-class-website-template/js/api-config.js`

Include this file in your HTML pages:
```html
<script src="js/api-config.js"></script>
```

## Next Steps

1. Update all environment variables with your actual credentials
2. Run database migrations
3. Test the API endpoints
4. Integrate with the frontend
5. Configure CORS settings in `.env` if frontend is on a different port/domain

## Support

For issues or questions, refer to:
- Prisma Documentation: https://www.prisma.io/docs
- Express Documentation: https://expressjs.com/
- Paystack Documentation: https://paystack.com/docs
