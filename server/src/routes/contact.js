import { Router } from 'express';
import { postContact } from '../controllers/contactController.js';

const router = Router();
router.post('/contact', postContact);

export default router;
