import { createTransport, renderEmailTemplate } from '../mailer.js';
import { env } from '../config/env.js';

// Log seguro da configuração (sem senha)
console.log('[Email] Config SMTP:', {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  user: env.SMTP_USER ? env.SMTP_USER.substring(0, 3) + '***' : undefined,
  from: env.FROM_EMAIL,
});

// Validação mínima de variáveis obrigatórias
const missing = ['SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASS','ADMIN_EMAIL'].filter(k => !env[k]);
if (missing.length) {
  console.error('[Email] Variáveis de ambiente ausentes:', missing.join(', '));
}

// Criar transporte SMTP (mutável para permitir fallback)
let transport = createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE, // porta 587 + secure=false => STARTTLS
  user: env.SMTP_USER,
  pass: env.SMTP_PASS,
});

// Verificação inicial do servidor SMTP (com fallback para 465 se 587 falhar por timeout)
let smtpReady = false;
let verifyPromise;
async function ensureTransportReady() {
  if (smtpReady) return true;
  if (verifyPromise) return verifyPromise;
  verifyPromise = (async () => {
    try {
      await transport.verify();
      smtpReady = true;
      console.log('[Email] SMTP verificado e pronto.');
      return true;
    } catch (err) {
      const code = String(err.code || err.message || '').toUpperCase();
      console.error('[Email] Verificação SMTP falhou:', code);
      const isTimeout = code.includes('ETIMEDOUT') || code.includes('ECONNECTION') || code.includes('ESOCKET');
      const usingGmail587 = String(env.SMTP_HOST).includes('smtp.gmail.com') && String(env.SMTP_PORT) === '587' && !env.SMTP_SECURE;
      if (isTimeout && usingGmail587) {
        console.log('[Email] Tentando fallback para porta 465 (SSL) ...');
        transport = createTransport({
          host: env.SMTP_HOST,
          port: 465,
          secure: true,
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        });
        try {
          await transport.verify();
          smtpReady = true;
          console.log('[Email] SMTP verificado via fallback 465 (SSL).');
          return true;
        } catch (err2) {
          console.error('[Email] Fallback 465 falhou:', err2.code || err2.message);
          return false;
        }
      }
      return false;
    }
  })();
  return verifyPromise;
}

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
    console.log('[Email] Iniciando envio...');
    const verified = await ensureTransportReady();
    if (!verified) {
      const err = new Error('Servidor SMTP indisponível');
      err.emailErrorType = 'smtp_unavailable';
      throw err;
    }
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
    const results = await Promise.allSettled([sendAdmin, sendUser]);
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      const reason = failures[0].reason || {};
      const code = reason.code || reason.responseCode || reason.message || 'unknown';
      console.error('[Email] Falha envio:', code);
      const error = new Error(code);
      error.emailErrorType = classifySmtpError(code);
      throw error;
    }
    console.log('[Email] Enviado com sucesso');
    return { success: true };
    
  } catch (error) {
    if (!error.emailErrorType) {
      error.emailErrorType = classifySmtpError(error.message);
    }
    console.error('[Email] Erro geral:', error.emailErrorType, error.message);
    throw error;
  }
}

function classifySmtpError(code) {
  const c = String(code || '').toUpperCase();
  if (c.includes('ETIMEDOUT') || c.includes('ECONNECTION') || c.includes('ESOCKET')) return 'timeout';
  if (c.includes('EAUTH') || c.includes('INVALID LOGIN') || c.includes('AUTH')) return 'auth';
  if (c.includes('ENOTFOUND') || c.includes('DNS')) return 'dns';
  if (c.includes('CERT') || c.includes('TLS')) return 'tls';
  if (c === 'UNKNOWN') return 'unknown';
  return 'general';
}
