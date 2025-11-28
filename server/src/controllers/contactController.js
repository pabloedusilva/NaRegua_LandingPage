import { z } from 'zod';
import { sendContactEmails } from '../services/emailService.js';

const ContactSchema = z.object({
  nome: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  mensagem: z.string().min(5, 'Mensagem muito curta'),
});

export async function postContact(req, res){
  const parse = ContactSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ ok: false, errors: parse.error.format() });
  }
  const { nome, email, mensagem } = parse.data;
  try {
    const logoUrl = `${process.env.CORS_ORIGIN}/imagens/logo.png`;
    await sendContactEmails({ nome, email, mensagem, logoUrl });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Contact error:', err);
    return res.status(500).json({ ok: false, error: 'Falha ao enviar e-mail' });
  }
}
