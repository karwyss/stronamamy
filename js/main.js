(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header state + sticky CTA + active nav on scroll
  var topBar = document.getElementById('topbar');
  var navAnchors = topBar ? topBar.querySelectorAll('.nav-link') : [];
  var sections = [];
  document.querySelectorAll('main section[id]').forEach(function (s) { sections.push(s); });
  var lastY = 0;

  function onScroll() {
    var y = window.scrollY;

    if (!REDUCED) {
      var heroBg = document.getElementById('hero-image');
      if (heroBg) {
        heroBg.style.transform = 'scale(1.04) translateY(' + Math.min(y * 0.08, 60) + 'px)';
      }
    }

    if (topBar) {
      if (y > 40) topBar.classList.add('is-scrolled');
      else topBar.classList.remove('is-scrolled');
    }

    var current = -1;
    for (var i = sections.length - 1; i >= 0; i--) {
      if (sections[i].getBoundingClientRect().top <= 180) {
        current = i;
        break;
      }
    }
    navAnchors.forEach(function (a) {
      var href = a.getAttribute('href');
      if (href && href.charAt(0) === '#') {
        var targetId = href.slice(1);
        if (targetId === 'start' && y < 180) {
          a.classList.add('is-active');
        } else if (sections[current] && sections[current].id === targetId) {
          a.classList.add('is-active');
        } else {
          a.classList.remove('is-active');
        }
      }
    });

    // Sticky bottom CTA (mobile)
    var cta = document.getElementById('sticky-cta');
    if (cta) {
      var contact = document.getElementById('kontakt');
      var inContact = contact && contact.getBoundingClientRect().top <= window.innerHeight && contact.getBoundingClientRect().bottom >= 0;
      if (y > 260 && !inContact) {
        cta.classList.add('is-visible');
        if (y < lastY) cta.classList.remove('is-hidden');
        else cta.classList.add('is-hidden');
      } else {
        cta.classList.remove('is-visible');
      }
    }
    lastY = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var menuOpen = false;
  var toggleBtn = document.getElementById('menu-toggle');
  var menuPanel = document.getElementById('mobile-menu');

  function setMenu(open) {
    menuOpen = open;
    if (!menuPanel || !toggleBtn) return;
    menuPanel.classList.toggle('hidden', !open);
    toggleBtn.setAttribute('aria-expanded', String(open));
    toggleBtn.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggleBtn && menuPanel) {
    toggleBtn.addEventListener('click', function () { setMenu(!menuOpen); });

    menuPanel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuOpen) setMenu(false);
    });
  }

  window.addEventListener('pageshow', function () { setMenu(false); });

  // Reveal on scroll (elementy nie są ukrywane, gdy JS jest wyłączony)
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !REDUCED) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          ro.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Method cards (accordion) – jeden otwarty na raz
  document.querySelectorAll('.method-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.method-card');
      var panel = card.querySelector('.accordion-panel');
      var arrow = card.querySelector('.method-arrow');
      var open = panel.classList.contains('is-open');

      document.querySelectorAll('.method-card').forEach(function (c) {
        var p = c.querySelector('.accordion-panel');
        var b = c.querySelector('.method-toggle');
        var ar = c.querySelector('.method-arrow');
        if (p) p.classList.remove('is-open');
        if (b) b.setAttribute('aria-expanded', 'false');
        if (ar) ar.textContent = '\uff0b';
      });
      card.classList.remove('is-open');

      if (!open) {
        panel.classList.add('is-open');
        card.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        if (arrow) arrow.textContent = '\u2212';
      } else {
        if (arrow) arrow.textContent = '\uff0b';
      }
    });
  });

  // FAQ accordions (niezależne)
  document.querySelectorAll('.faq-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = btn.nextElementSibling;
      var icon = btn.querySelector('.faq-icon');
      var open = panel.classList.contains('is-open');
      panel.classList.toggle('is-open', !open);
      btn.setAttribute('aria-expanded', String(!open));
      if (icon) icon.textContent = open ? '\uff0b' : '\u2212';
    });
  });

  // Lightbox gallery
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxCap = document.getElementById('lightbox-caption');
  var currentIndex = 0;
  var lastTrigger = null;

  function showLightbox(i) {
    if (!lightbox) return;
    if (i < 0) i = galleryItems.length - 1;
    if (i >= galleryItems.length) i = 0;
    currentIndex = i;
    var item = galleryItems[i];
    var img = item.querySelector('img');
    lightboxImg.src = item.getAttribute('data-full') || (img ? img.getAttribute('src') : '');
    lightboxImg.alt = img ? (img.getAttribute('alt') || '') : '';
    if (lightboxCap) lightboxCap.textContent = item.getAttribute('data-caption') || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var close = lightbox.querySelector('.lightbox-close');
    if (close) close.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lightboxImg) lightboxImg.src = '';
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
  }

  galleryItems.forEach(function (item, i) {
    item.addEventListener('click', function () { lastTrigger = item; showLightbox(i); });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        lastTrigger = item;
        showLightbox(i);
      }
    });
  });

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target === lightboxImg) closeLightbox();
    });
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', function () { showLightbox(currentIndex - 1); });
    lightbox.querySelector('.lightbox-next').addEventListener('click', function () { showLightbox(currentIndex + 1); });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showLightbox(currentIndex - 1);
      if (e.key === 'ArrowRight') showLightbox(currentIndex + 1);
    });
  }

  // Contact form -> build mailto
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var subject = encodeURIComponent('Zapytanie ze strony FIZJOKIDS');
      var body = encodeURIComponent(
        'Imię rodzica: ' + (fd.get('pname') || '') + '\n' +
        'Imię dziecka: ' + (fd.get('cname') || '') + '\n' +
        'Wiek dziecka: ' + (fd.get('cage') || '') + '\n' +
        'Telefon: ' + (fd.get('phone') || '') + '\n' +
        'Opis problemu:\n' + (fd.get('message') || '')
      );
      window.location.href = 'mailto:trycha84@interia.pl?subject=' + subject + '&body=' + body;
    });
  }
})();