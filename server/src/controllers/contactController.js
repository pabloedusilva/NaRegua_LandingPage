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
    
    // Enviar e-mails
    const logoUrl = `${process.env.CORS_ORIGIN || 'http://localhost:4000'}/imagens/logo.png`;
    await sendContactEmails({ nome, email, mensagem, logoUrl });
    
    return res.json({ 
      ok: true, 
      message: 'Mensagem enviada com sucesso!' 
    });
    
  } catch (err) {
    
    // Não expor detalhes internos do erro
    return res.status(500).json({ 
      ok: false, 
      error: 'Falha ao enviar mensagem. Tente novamente mais tarde.' 
    });
  }
}
