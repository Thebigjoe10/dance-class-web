import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  PAYSTACK_SECRET_KEY: z.string(),
  PAYSTACK_PUBLIC_KEY: z.string(),
  PAYSTACK_WEBHOOK_SECRET: z.string().optional(),

  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_SECURE: z.string().default('false'),
  SMTP_USER: z.string(),
  SMTP_PASSWORD: z.string(),
  EMAIL_FROM: z.string().email(),

  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),

  TICKET_QR_SIZE: z.string().default('300'),
  SEAT_HOLD_DURATION_MINUTES: z.string().default('15'),
});

const env = envSchema.parse(process.env);

export const config = {
  database: {
    url: env.DATABASE_URL,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  server: {
    port: parseInt(env.PORT, 10),
    env: env.NODE_ENV,
  },
  paystack: {
    secretKey: env.PAYSTACK_SECRET_KEY,
    publicKey: env.PAYSTACK_PUBLIC_KEY,
    webhookSecret: env.PAYSTACK_WEBHOOK_SECRET || '',
  },
  email: {
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT, 10),
    secure: env.SMTP_SECURE === 'true',
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD,
    from: env.EMAIL_FROM,
  },
  frontend: {
    url: env.FRONTEND_URL,
  },
  rateLimit: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
    max: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
  },
  ticket: {
    qrSize: parseInt(env.TICKET_QR_SIZE, 10),
    seatHoldDuration: parseInt(env.SEAT_HOLD_DURATION_MINUTES, 10),
  },
};
