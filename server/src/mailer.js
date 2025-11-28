import nodemailer from 'nodemailer';

export function createTransport({ host, port, secure, user, pass }) {
  // Timeouts para evitar requests penduradas em ambiente de produção
  // port 587 com secure=false ativa STARTTLS (mais confiável em hosts cloud)
  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: secure === 'true' || secure === true,
    auth: { 
      user: user.trim(), 
      pass: pass.trim() 
    },
    connectionTimeout: 20000,
    greetingTimeout: 15000,
    socketTimeout: 25000,
    pool: false,
    debug: false,
    logger: false,
  });
}

// Tema alinhado com o site: dark minimalista, acentos dourados, tipografia Poppins/Bebas
export function renderEmailTemplate({ 
  logoUrl, 
  title, 
  intro, 
  sections = [], 
  footer = '', 
  headingAlign = 'left',
  containerWidth = 700 
}) {
  const palette = {
    gold: '#c9953b',
    bg: '#0f0f10',
    surface: '#1c1c1c',
    border: '#2a2a2a',
    text: '#f7f7f5',
    textDim: '#cfcfcb',
  };

  const sectionsHtml = sections
    .map(({ heading, body }) => `
      <tr>
        <td style="padding: 0 0 18px 0;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: ${palette.text}; letter-spacing: .02em;">${heading}</h3>
          <p style="margin: 0; font-size: 14px; line-height: 1.7; color: ${palette.textDim}; white-space: pre-wrap;">${body}</p>
        </td>
      </tr>
    `)
    .join('');

  // Nota: uso de tabelas para compatibilidade com clientes de e-mail
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background:${palette.bg};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${palette.bg}; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="${containerWidth}" cellpadding="0" cellspacing="0" style="max-width:${containerWidth}px; background:${palette.surface}; border:1px solid ${palette.border}; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.35); overflow:hidden;">
          ${logoUrl ? `
          <tr>
            <td align="center" style="padding: 26px 28px 0 28px; text-align: center;">
              <img src="${logoUrl}" alt="Na-Régua" style="max-width:140px; height:auto; display:inline-block; filter: drop-shadow(0 2px 6px rgba(0,0,0,.35));">
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 24px 28px 8px 28px;">
              <h1 style="margin:0 0 6px 0; font-size:24px; font-weight:700; color:${palette.gold}; letter-spacing:.03em;">${title}</h1>
              <p style="margin:0; font-size:14px; color:${palette.textDim};">${intro}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 28px 4px 28px;">
              <hr style="border:none; height:1px; background:${palette.border}; margin: 8px 0 18px 0;">
            </td>
          </tr>
          <tr>
            <td style="padding: 0 28px 8px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${sectionsHtml}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 28px 26px 28px;">
              ${footer ? `<p style="margin: 18px 0 0 0; font-size: 12px; color:${palette.textDim};">${footer}</p>` : ''}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                <tr>
                  <td>
                    <div style="height:1px; background:${palette.border};"></div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;">
                    <p style="margin:0; font-size:11px; color:${palette.textDim}; opacity:.85;">© Na-Régua</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
