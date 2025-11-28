import { createTransport, renderEmailTemplate } from '../mailer.js';
import { env } from '../config/env.js';

// Criar transporte SMTP
const transport = createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  user: env.SMTP_USER,
  pass: env.SMTP_PASS,
});

// Função para escapar HTML e prevenir XSS
const escapeHtml = (str) => String(str || '')
  .replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[c]);

/**
 * Envia e-mails de contato para admin e usuário
 * @param {Object} params
 * @param {string} params.nome - Nome do contato
 * @param {string} params.email - E-mail do contato
 * @param {string} params.mensagem - Mensagem enviada
 * @param {string} params.logoUrl - URL do logo
 */
export async function sendContactEmails({ nome, email, mensagem, logoUrl }) {
  try {
    // E-mail para o administrador
    const adminHtml = renderEmailTemplate({
      logoUrl,
      title: 'Na-Régua — Novo contato',
      intro: 'Você recebeu uma nova mensagem de contato.',
      headingAlign: 'left',
      containerWidth: 700,
      sections: [
        { heading: 'Nome', body: escapeHtml(nome) },
        { heading: 'E-mail', body: escapeHtml(email) },
        { heading: 'Mensagem', body: escapeHtml(mensagem) },
      ],
      footer: 'Este e-mail foi gerado automaticamente pelo sistema de contato Na-Régua.'
    });

    // E-mail para o usuário
    const userHtml = renderEmailTemplate({
      logoUrl,
      title: 'Na-Régua — Confirmação de contato',
      intro: 'Obrigado pelo seu contato! Recebemos sua mensagem.',
      headingAlign: 'left',
      containerWidth: 700,
      sections: [
        { heading: 'Resumo', body: 'Nossa equipe responderá em breve pelo seu e-mail.' },
        { heading: 'Sua mensagem', body: escapeHtml(mensagem) },
      ],
      footer: 'Se você não reconhece este contato, ignore este e-mail.'
    });

    const sendAdmin = transport.sendMail({
      from: { name: env.FROM_NAME, address: env.FROM_EMAIL },
      to: env.ADMIN_EMAIL,
      replyTo: email,
      subject: `Novo contato de ${nome} — Na-Régua`,
      html: adminHtml,
    });
    const sendUser = transport.sendMail({
      from: { name: env.FROM_NAME, address: env.FROM_EMAIL },
      to: email,
      subject: `Olá ${nome}, obrigado pelo seu contato com Na-Régua`,
      html: userHtml,
    });
    await Promise.allSettled([sendAdmin, sendUser]);
    return { success: true };
    
  } catch (error) {
    throw new Error('Falha ao enviar e-mails');
  }
}
