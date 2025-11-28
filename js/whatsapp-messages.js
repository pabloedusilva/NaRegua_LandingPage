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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyMessages);
  } else {
    applyMessages();
  }
})();
