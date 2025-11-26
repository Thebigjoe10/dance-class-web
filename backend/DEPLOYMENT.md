# Deployment Guide - Dance School Backend API

This guide covers deploying the Dance School Backend API to various platforms.

## Prerequisites

- PostgreSQL database (managed or self-hosted)
- Node.js 18+ runtime environment
- Environment variables configured
- Domain name (optional but recommended for production)

## Environment Variables Checklist

Ensure all these variables are set before deployment:

```
✓ DATABASE_URL
✓ JWT_SECRET (minimum 32 characters)
✓ JWT_EXPIRES_IN
✓ PORT
✓ NODE_ENV (set to "production")
✓ PAYSTACK_SECRET_KEY
✓ PAYSTACK_PUBLIC_KEY
✓ PAYSTACK_WEBHOOK_SECRET
✓ SMTP_HOST
✓ SMTP_PORT
✓ SMTP_SECURE
✓ SMTP_USER
✓ SMTP_PASSWORD
✓ EMAIL_FROM
✓ FRONTEND_URL
✓ RATE_LIMIT_WINDOW_MS
✓ RATE_LIMIT_MAX_REQUESTS
```

## Deployment Options

### Option 1: Railway (Recommended for Beginners)

Railway provides automatic deployments with built-in PostgreSQL.

#### Steps:

1. **Create Railway Account**
   - Visit https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login
   railway login

   # Initialize project
   railway init
   ```

3. **Add PostgreSQL Database**
   - In Railway dashboard, click "New"
   - Select "Database" → "PostgreSQL"
   - Copy the DATABASE_URL from variables

4. **Configure Environment Variables**
   - Go to project settings
   - Add all environment variables
   - Railway automatically sets DATABASE_URL

5. **Deploy**
   ```bash
   railway up
   ```

6. **Run Migrations**
   ```bash
   railway run npx prisma migrate deploy
   ```

7. **Generate Domain**
   - Go to Settings → Domains
   - Generate a Railway domain or add custom domain

**Cost**: ~$5-20/month depending on usage

---

### Option 2: Render

Render offers a free tier perfect for testing.

#### Steps:

1. **Create Render Account**
   - Visit https://render.com
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - New → PostgreSQL
   - Choose free tier or paid
   - Copy Internal Database URL

3. **Create Web Service**
   - New → Web Service
   - Connect your GitHub repository
   - Select `backend` directory (if monorepo)

4. **Configure Build Settings**
   ```
   Build Command: npm install && npm run build && npx prisma generate
   Start Command: npx prisma migrate deploy && npm start
   ```

5. **Add Environment Variables**
   - Add all variables from checklist
   - Use the PostgreSQL Internal URL for DATABASE_URL

6. **Deploy**
   - Render automatically deploys on git push

**Cost**: Free tier available, paid plans from $7/month

---

### Option 3: Heroku

Classic PaaS platform with extensive add-ons.

#### Steps:

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   heroku create dance-school-api
   ```

3. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set JWT_SECRET="your-secret-key"
   heroku config:set NODE_ENV="production"
   # ... set all other variables
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Run Migrations**
   ```bash
   heroku run npx prisma migrate deploy
   ```

**Cost**: $5-7/month for basic PostgreSQL

---

### Option 4: DigitalOcean App Platform

#### Steps:

1. **Create DigitalOcean Account**
   - Visit https://www.digitalocean.com

2. **Create App**
   - Apps → Create App
   - Connect GitHub repository

3. **Add Database**
   - Add Component → Database
   - Choose Managed PostgreSQL
   - Note the connection string

4. **Configure App**
   ```
   Build Command: npm install && npm run build && npx prisma generate
   Run Command: npx prisma migrate deploy && npm start
   ```

5. **Set Environment Variables**
   - Add all variables in App Settings

6. **Deploy**
   - DigitalOcean handles deployments automatically

**Cost**: $12-25/month for app + database

---

### Option 5: AWS (Advanced)

For production-grade deployment with full control.

#### Architecture:

- **EC2** - Application server
- **RDS PostgreSQL** - Database
- **Application Load Balancer** - Load balancing
- **Route 53** - DNS
- **CloudWatch** - Monitoring

#### Steps:

1. **Set up RDS PostgreSQL**
   - Create PostgreSQL instance
   - Configure security groups
   - Note connection details

2. **Launch EC2 Instance**
   ```bash
   # Choose Ubuntu 22.04 LTS
   # t3.small or larger recommended
   ```

3. **Install Dependencies**
   ```bash
   # SSH into EC2
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

4. **Deploy Application**
   ```bash
   # Clone repo
   git clone <your-repo-url>
   cd backend

   # Install dependencies
   npm ci --only=production

   # Build
   npm run build

   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate deploy
   ```

5. **Set Up PM2**
   ```bash
   # Create .env file with production variables

   # Start with PM2
   pm2 start dist/server.js --name dance-api
   pm2 startup
   pm2 save
   ```

6. **Configure Nginx as Reverse Proxy**
   ```bash
   sudo apt install nginx
   ```

   Create `/etc/nginx/sites-available/dance-api`:
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/dance-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Set Up SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

**Cost**: $30-100+/month depending on instance sizes

---

## Post-Deployment Steps

### 1. Verify Deployment

```bash
# Health check
curl https://your-domain.com/api/health

# Should return:
# {"success":true,"message":"Dance School API is running","timestamp":"..."}
```

### 2. Create Admin User

Use the API or directly in database:

```bash
# Via API (requires temp admin or direct DB access)
curl -X POST https://your-domain.com/api/auth/admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@danceschool.com",
    "password": "SecureAdminPassword123!",
    "name": "Admin User"
  }'
```

### 3. Configure Paystack Webhook

1. Log in to Paystack Dashboard
2. Settings → Webhooks
3. Add webhook URL: `https://your-domain.com/api/paystack/webhook`
4. Copy webhook secret
5. Add to environment variables
6. Redeploy if needed

### 4. Test Critical Flows

**Test Event Purchase:**
```bash
# 1. Create event (admin)
# 2. Checkout as guest
# 3. Complete payment on Paystack
# 4. Verify ticket received via email
# 5. Verify QR code works
```

**Test Student Registration:**
```bash
# 1. Register student
# 2. Verify email
# 3. Enroll in class
# 4. Verify enrollment appears in student dashboard
```

### 5. Set Up Monitoring

#### Option A: Sentry (Error Tracking)

```bash
npm install @sentry/node

# In src/server.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

#### Option B: LogTail (Log Management)

```bash
npm install @logtail/node

# Configure in your app
```

### 6. Set Up Automated Backups

**For PostgreSQL:**
```bash
# Daily backup script
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Upload to S3
aws s3 cp backup-$(date +%Y%m%d).sql s3://your-backup-bucket/
```

**Or use managed backup solutions:**
- Railway: Automatic backups included
- Render: Automatic backups on paid plans
- AWS RDS: Automated backups

---

## Scaling Considerations

### Horizontal Scaling

For high traffic:

1. **Load Balancer**: Use Nginx, AWS ALB, or platform load balancer
2. **Multiple Instances**: Run multiple API instances
3. **Database Read Replicas**: For read-heavy workloads
4. **Redis Cache**: Cache frequent queries
5. **CDN**: Serve static assets via CDN

### Vertical Scaling

Upgrade server resources:
- More CPU for compute-heavy operations
- More RAM for caching
- Faster disk I/O for database operations

---

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db pull

# Check DATABASE_URL format
postgresql://user:password@host:port/database?schema=public
```

### Migration Failures

```bash
# Reset database (development only!)
npx prisma migrate reset

# Production: manual rollback
npx prisma migrate resolve --rolled-back <migration-name>
```

### Port Already in Use

```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Email Not Sending

- Verify SMTP credentials
- Check firewall rules (port 587 or 465)
- Use app-specific password for Gmail
- Check spam folder

---

## Security Checklist

- [ ] JWT_SECRET is strong (32+ random characters)
- [ ] NODE_ENV set to "production"
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS configured for frontend domain only
- [ ] Rate limiting enabled
- [ ] Database credentials secure
- [ ] Environment variables not committed to git
- [ ] Webhook signatures verified
- [ ] SQL injection protection (Prisma handles this)
- [ ] Input validation on all endpoints

---

## Maintenance

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Update Prisma
npm install @prisma/client@latest prisma@latest
npx prisma generate
```

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name description

# Deploy to production
npx prisma migrate deploy
```

### Monitor Performance

- Database query performance
- API response times
- Error rates
- Memory usage
- CPU usage

---

## Cost Estimates

| Platform | Database | Total/Month |
|----------|----------|-------------|
| Railway | Included | $5-20 |
| Render Free | $7 external | $7 |
| Render Paid | $7 + $7 | $14 |
| Heroku | $5 | $12 |
| DigitalOcean | $12 + $15 | $27 |
| AWS | Variable | $30-100+ |

---

## Support

For deployment issues:
- Check platform documentation
- Review application logs
- Test locally first
- Contact support@danceschool.com
