import { createTransport, renderEmailTemplate } from '../mailer.js';
import { env } from '../config/env.js';

const transport = createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  user: env.SMTP_USER,
  pass: env.SMTP_PASS,
});

export async function sendContactEmails({ nome, email, mensagem, logoUrl }){
  const escapeHtml = (str) => String(str || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[c]);
  const adminHtml = renderEmailTemplate({
    logoUrl,
    title: 'Novo contato — Na-Régua',
    intro: 'Novo contato recebido',
    headingAlign: 'center',
    containerWidth: 900,
    sections: [
      { heading: 'Nome', body: escapeHtml(nome) },
      { heading: 'E-mail', body: escapeHtml(email) },
      { heading: 'Mensagem', body: escapeHtml(mensagem) },
    ],
    footer: 'Atenciosamente, equipe Na-Régua',
  });

  const userHtml = renderEmailTemplate({
    logoUrl,
    title: 'Obrigado pelo contato — Na-Régua',
    intro: 'Obrigado pelo seu contato! 🎉',
    sections: [
      { heading: 'Resumo', body: 'Recebemos sua mensagem e nossa equipe responderá em breve.' },
      { heading: 'Sua mensagem', body: mensagem },
    ],
    footer: 'Atenciosamente, equipe Na-Régua',
  });

  await transport.sendMail({
    from: { name: env.FROM_NAME, address: env.FROM_EMAIL },
    to: env.ADMIN_EMAIL,
    replyTo: email,
    subject: `Novo contato de ${nome} — Na-Régua`,
    html: adminHtml,
  });

  await transport.sendMail({
    from: { name: env.FROM_NAME, address: env.FROM_EMAIL },
    to: email,
    subject: `Olá ${nome}, obrigado pelo seu contato com Na-Régua`,
    html: userHtml,
  });
}
