import { z } from 'zod';
import { sendContactEmails } from '../services/emailService.js';

// Schema de validação com mensagens em português
const ContactSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome muito longo'),
  email: z.string()
    .email('E-mail inválido')
    .max(100, 'E-mail muito longo'),
  mensagem: z.string()
    .min(5, 'Mensagem deve ter no mínimo 5 caracteres')
    .max(1000, 'Mensagem muito longa'),
});

export async function postContact(req, res) {
  try {
    // Validação dos dados
    const parse = ContactSchema.safeParse(req.body);
    
    if (!parse.success) {
      const errors = parse.error.issues.map(issue => ({
        field: issue.path[0],
        message: issue.message
      }));
      
      return res.status(400).json({ 
        ok: false, 
        error: 'Dados inválidos',
        details: errors 
      });
    }

    const { nome, email, mensagem } = parse.data;
    
    // Enviar e-mails com timeout de segurança para não travar a resposta
    const logoUrl = `${process.env.CORS_ORIGIN || 'http://localhost:4000'}/imagens/logo.png`;
    const TIMEOUT_MS = 12000;
    const result = await Promise.race([
      sendContactEmails({ nome, email, mensagem, logoUrl }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS))
    ]);
    
    return res.json({ 
      ok: true, 
      message: 'Mensagem enviada com sucesso!' 
    });
    
  } catch (err) {
    const type = err.emailErrorType || (err && err.message === 'timeout' ? 'timeout' : 'general');
    let status = 500;
    let msg;
    switch (type) {
      case 'timeout':
        status = 504;
        msg = 'Serviço de e-mail demorou a responder. Tente novamente.';
        break;
      case 'auth':
        msg = 'Falha de autenticação SMTP. Verifique usuário/app password.';
        break;
      case 'dns':
        msg = 'Problema DNS ao resolver servidor SMTP.';
        break;
      case 'tls':
        msg = 'Erro de handshake TLS com servidor SMTP.';
        break;
      case 'smtp_unavailable':
        msg = 'Servidor SMTP indisponível no momento.';
        break;
      default:
        msg = 'Falha ao enviar mensagem. Tente novamente mais tarde.';
    }
    return res.status(status).json({ 
      ok: false, 
      error: msg,
      type
    });
  }
}
