// WhatsApp dynamic message assignment
(function(){
  const WA_NUMBER = '5531985079718';
  const WA_MESSAGES = {
    interest: 'Olá! Tenho interesse em saber mais sobre o aplicativo Naregua Agendamentos e os planos disponíveis. Pode me enviar mais detalhes?',
    monthly: 'Olá! Tenho interesse em assinar o Plano Mensal do Naregua Agendamentos. Pode me enviar os próximos passos para concluir a assinatura?',
    trimestral: 'Olá! Quero assinar o Plano Trimestral do Naregua Agendamentos. Pode me informar como finalizar a assinatura?'
  };

  function applyMessages(){
    document.querySelectorAll('[data-wa-type]').forEach(el => {
      const type = el.getAttribute('data-wa-type');
      const msg = WA_MESSAGES[type];
      if (!msg) return;
      const encoded = encodeURIComponent(msg);
      const url = `https://wa.me/${WA_NUMBER}?text=${encoded}`;
      el.setAttribute('href', url);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    });
  }

  function buildWhatsAppMessage({ nome, email, mensagem }) {
    const linhas = [
      `👤 Nome: ${nome || '—'}`,
      email ? `📧 E-mail: ${email}` : '📧 E-mail: (não informado)',
      '🗨️ Mensagem:',
      mensagem || '—'
    ];
    return linhas.join('\n');
  }

  function initFormWhatsApp(){
    const form = document.querySelector('.contact-form');
    if (!form) return;
    const waBtn = form.querySelector('.btn-wa-send');
    const nomeEl = form.querySelector('input[name="nome"]');
    const msgEl = form.querySelector('textarea[name="mensagem"]');
    const emailEl = form.querySelector('input[name="email"]');
    if (!waBtn) return;
    waBtn.disabled = false;
    waBtn.classList.remove('disabled');
    [nomeEl, msgEl, emailEl].filter(Boolean).forEach(el => {
      el.addEventListener('input', () => el.classList.remove('field-error'));
    });
    waBtn.addEventListener('click', () => {
      const nome = nomeEl?.value.trim();
      const mensagem = msgEl?.value.trim();
      const email = emailEl?.value.trim();
      let hasError = false;
      if (!nome) { nomeEl.classList.add('field-error'); hasError = true; }
      if (!mensagem) { msgEl.classList.add('field-error'); hasError = true; }
      if (hasError) {
        waBtn.animate([
          { transform: 'translateX(0)' },
          { transform: 'translateX(-3px)' },
          { transform: 'translateX(3px)' },
          { transform: 'translateX(0)' }
        ], { duration: 180 });
        return;
      }
      const text = buildWhatsAppMessage({ nome, email, mensagem });
      const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank', 'noopener');
    });
  }

  function init(){
    applyMessages();
    initFormWhatsApp();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
