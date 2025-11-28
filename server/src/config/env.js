import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

export const env = {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  FROM_NAME: process.env.FROM_NAME || 'Na-Régua',
  FROM_EMAIL: process.env.FROM_EMAIL || process.env.SMTP_USER,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  EMAIL_TIMEOUT_MS: Number(process.env.EMAIL_TIMEOUT_MS) || 30000,
  PORT: Number(process.env.PORT) || 4000,
};
