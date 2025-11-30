// Migrated from original script.js (navigation, smooth scroll, form, reveal)
(function(){
  const navToggle = document.querySelector('.nav-toggle');
  let mobileMenu = null;
  function ensureMobileMenu(){
    if (mobileMenu) return mobileMenu;
    mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.innerHTML = `
      <nav role="dialog" aria-modal="true" aria-label="Menu">
        <a href="#home" class="menu-link">Início</a>
        <a href="#features" class="menu-link">Recursos</a>
        <button type="button" class="menu-link menu-item" data-submenu="cliente">
          <span>Cliente</span>
          <span class="arrow" aria-hidden="true"></span>
        </button>
        <div class="submenu" data-submenu-content="cliente" hidden>
          <a href="#cliente">Experiência do Cliente</a>
          <a href="#screens">Review de Telas - Cliente</a>
        </div>
        <button type="button" class="menu-link menu-item" data-submenu="barber">
          <span>Barbeiro</span>
          <span class="arrow" aria-hidden="true"></span>
        </button>
        <div class="submenu" data-submenu-content="barber" hidden>
          <a href="#barber">Experiência do Barbeiro</a>
          <a href="#screens-barber">Review de Telas - Barbeiro</a>
        </div>
        <a href="#planos" class="menu-link">Planos</a>
        <a href="#contato" class="menu-link">Contato</a>
      </nav>
    `;
    document.body.appendChild(mobileMenu);
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) closeMenu();
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    mobileMenu.querySelectorAll('button.menu-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-submenu');
        const content = mobileMenu.querySelector(`[data-submenu-content="${key}"]`);
        const expanded = btn.classList.toggle('expanded');
        if (content) {
          content.hidden = !expanded;
          mobileMenu.querySelectorAll('button.menu-item').forEach(other => {
            if (other !== btn) {
              other.classList.remove('expanded');
              const k = other.getAttribute('data-submenu');
              const c = mobileMenu.querySelector(`[data-submenu-content="${k}"]`);
              if (c) c.hidden = true;
            }
          });
        }
      });
    });
    return mobileMenu;
  }
  function closeMenu(){
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const menu = ensureMobileMenu();
      const open = !menu.classList.contains('open');
      menu.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        menu.querySelectorAll('button.menu-item').forEach(btn => {
          btn.classList.remove('expanded');
          const key = btn.getAttribute('data-submenu');
          const content = menu.querySelector(`[data-submenu-content="${key}"]`);
          if (content) content.hidden = true;
        });
      }
    });
  }
  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  // Botão dedicado para enviar pelo WhatsApp com template organizado
  // Scroll reveal
  const revealSelector = [
    'section.section',
    '.features .feature-grid',
    '.feature',
    '.barber .panel',
    '.pricing-card',
    '.screen-card',
    '.cta .contact-form'
  ];
  const allReveal = document.querySelectorAll(revealSelector.join(','));
  allReveal.forEach(el => {
    if (el.classList.contains('feature-grid') || el.classList.contains('contact-form')) {
      el.classList.add('reveal', 'reveal-stagger');
    } else {
      el.classList.add('reveal');
    }
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
  allReveal.forEach(el => io.observe(el));
})();

// Plans Drawer interactions (open/close + drag to close)
(function(){
  const openBtn = document.getElementById('open-plans-modal');
  const overlay = document.getElementById('plansDrawerOverlay');
  const drawer = document.getElementById('plansDrawer');
  const handle = document.getElementById('plansDrawerHandle');
  const closeBtn = document.getElementById('plansDrawerClose');
  if (!openBtn || !overlay || !drawer || !handle || !closeBtn) return;

  let startY = 0;
  let currentY = 0;
  let dragging = false;

  function openDrawer(){
    overlay.hidden = false;
    requestAnimationFrame(() => drawer.classList.add('open'));
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer(){
    drawer.classList.remove('open');
    drawer.style.transform = '';
    currentY = 0;
    dragging = false;
    setTimeout(() => { overlay.hidden = true; document.body.style.overflow = ''; }, 220);
  }

  openBtn.addEventListener('click', (e) => { e.preventDefault(); openDrawer(); });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeDrawer(); });
  closeBtn.addEventListener('click', closeDrawer);

  function onPointerDown(e){
    dragging = true;
    startY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    drawer.style.transition = 'none';
    handle.setPointerCapture && handle.setPointerCapture(e.pointerId || 0);
  }
  function onPointerMove(e){
    if (!dragging) return;
    const y = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    currentY = Math.max(0, y - startY);
    drawer.style.transform = `translateY(${currentY}px)`;
  }
  function onPointerUp(){
    if (!dragging) return;
    drawer.style.transition = '';
    if (currentY >= 100) {
      closeDrawer();
    } else {
      drawer.style.transform = '';
    }
    dragging = false;
  }

  // Support mouse, touch, and pointer
  handle.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  handle.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('touchend', onPointerUp);
})();
