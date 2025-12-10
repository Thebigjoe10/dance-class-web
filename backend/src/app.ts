import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.frontend.url,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (config.server.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use(generalLimiter);

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Dance School API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

export default app;
