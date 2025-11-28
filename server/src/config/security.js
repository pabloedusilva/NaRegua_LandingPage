import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './env.js';

export const helmetMiddleware = helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } });

const allowedOrigins = [
  env.CORS_ORIGIN,
  'http://localhost:4000',
  'http://127.0.0.1:4000'
];

export const corsMiddleware = cors({ 
  origin: (origin, callback) => {
    // Permite requisições sem origem (ex: Postman, mesmo servidor)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: false 
});

export const apiLimiter = rateLimit({ windowMs: 60 * 1000, limit: 10 });
