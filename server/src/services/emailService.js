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

// Helper para criar transport com base em host/port/secure
function buildTransport({ port, secure }) {
  return createTransport({
    host: env.SMTP_HOST,
    port,
    secure,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  });
}

// Decidir configuração inicial priorizando Gmail 465/SSL, como no app que já funciona
const isGmail = String(env.SMTP_HOST || '').includes('smtp.gmail.com');
let currentPort = Number(env.SMTP_PORT);
let currentSecure = !!env.SMTP_SECURE;
if (isGmail) {
  // Forçar 465/SSL se o usuário configurou 587 sem secure
  if (String(env.SMTP_PORT) === '587' && !env.SMTP_SECURE) {
    console.log('[Email] Ajustando SMTP para Gmail: usando 465/SSL');
    currentPort = 465;
    currentSecure = true;
  }
}

let transport = buildTransport({ port: currentPort, secure: currentSecure });

// Sem verify() para evitar atrasos. Faremos retry com fallback no próprio envio.

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
    let results = await Promise.allSettled([sendAdmin, sendUser]);
    let failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      // Fallback: se falhou por timeout/conexão, tentar alternar porta/secure uma vez
      const reason = failures[0].reason || {};
      const code = String(reason.code || reason.responseCode || reason.message || '').toUpperCase();
      const isConn = code.includes('ETIMEDOUT') || code.includes('ECONNECTION') || code.includes('ESOCKET');
      const alt = currentSecure && currentPort === 465
        ? { port: 587, secure: false }
        : { port: 465, secure: true };
      if (isConn) {
        console.warn('[Email] Falha de conexão. Retentando com', alt);
        transport = buildTransport(alt);
        currentPort = alt.port; currentSecure = alt.secure;
        const retryAdmin = transport.sendMail({
          from: { name: env.FROM_NAME, address: env.FROM_EMAIL },
          to: env.ADMIN_EMAIL,
          replyTo: email,
          subject: `Novo contato de ${nome} — Na-Régua`,
          html: adminHtml,
        });
        const retryUser = transport.sendMail({
          from: { name: env.FROM_NAME, address: env.FROM_EMAIL },
          to: email,
          subject: `Olá ${nome}, obrigado pelo seu contato com Na-Régua`,
          html: userHtml,
        });
        results = await Promise.allSettled([retryAdmin, retryUser]);
        failures = results.filter(r => r.status === 'rejected');
      }
      if (failures.length > 0) {
        const r2 = failures[0].reason || {};
        const code2 = r2.code || r2.responseCode || r2.message || 'unknown';
        console.error('[Email] Falha envio:', code2);
        const error = new Error(code2);
        error.emailErrorType = classifySmtpError(code2);
        throw error;
      }
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
