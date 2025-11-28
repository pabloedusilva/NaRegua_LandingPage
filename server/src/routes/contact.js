import { Router } from 'express';
import { postContact } from '../controllers/contactController.js';
import { contactLimiter } from '../config/security.js';

const router = Router();

// Aplicar rate limiting específico para contato
router.post('/contact', contactLimiter, postContact);

export default router;
