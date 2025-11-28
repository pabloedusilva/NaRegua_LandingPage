import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './env.js';

// Configuração do Helmet para segurança
export const helmetMiddleware = helmet({ 
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
});

const allowedOrigins = [
  env.CORS_ORIGIN,
  'http://localhost:4000',
  'http://127.0.0.1:4000',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];

// Configuração de CORS
export const corsMiddleware = cors({ 
  origin: (origin, callback) => {
    // Permite requisições sem origem (ex: Postman, mesmo servidor, Vercel serverless)
    if (!origin) return callback(null, true);
    
    // Permite origens da lista de permitidas
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Permite qualquer subdomínio do Vercel em desenvolvimento
    if (origin && origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: false 
});

// Rate limiting para a API - 10 requisições por minuto
export const apiLimiter = rateLimit({ 
  windowMs: 60 * 1000, 
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições, tente novamente mais tarde.' }
});

// Rate limiting mais restritivo para o endpoint de contato - 3 requisições por minuto
export const contactLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de envio. Aguarde um momento.' }
});
