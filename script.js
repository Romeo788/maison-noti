/* ============================================
   ENZO PIZZA & MAISON NOTI — Shared JS v3
   ============================================ */

/* Anti page blanche : le filet de sécurité ne vit PAS dans ce fichier.
   Il est inline dans le <head> de chaque page, avec la classe .no-js.
   Raison : un filet placé ici ne couvrirait pas les cas où ce fichier
   est absent, en 404 ou en erreur de syntaxe — c'est-à-dire les pannes
   les plus probables. Voir le commentaire en tête de style.css. */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile nav toggle ---- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('open');
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        links.classList.remove('open');
      });
    });
  }

  /* ---- Active nav link ---- */
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a:not(.nav-cta)').forEach(a => {
    a.classList.remove('active');
    const href = a.getAttribute('href');
    if (href === path || (path === '/' && href === '/')) {
      a.classList.add('active');
    }
  });

  /* ---- Header shadow on scroll ---- */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Reveal on scroll (all variants) ---- */
  const revealSelectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
  const revealEls = document.querySelectorAll(revealSelectors);
  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ---- Smooth scroll for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = header ? header.offsetHeight + 16 : 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- Menu scroll spy (pizzeria page) ---- */
  const menuNavItems = document.querySelectorAll('.menu-nav-item');
  const menuCategories = document.querySelectorAll('.menu-category');
  if (menuNavItems.length && menuCategories.length) {
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          menuNavItems.forEach(item => {
            item.classList.toggle('active', item.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.1, rootMargin: '-100px 0px -60% 0px' });
    menuCategories.forEach(cat => spyObserver.observe(cat));
  }

  /* =================================================================
     PIZZAS DU MOMENT — affichage automatique de la disponibilité
     =================================================================
     À LIRE MÊME SI VOUS NE CODEZ PAS :

     Dans index.html et pizzeria.html, chaque pizza du moment porte
     un attribut data-mois. Il contient les mois où la pizza est
     proposée, en chiffres séparés par des virgules :
       1 = janvier, 2 = février, 3 = mars, … 12 = décembre.

     Exemple :  data-mois="6,7,8"   ->  juin, juillet, août.

     Ce bloc compare le mois en cours à cette liste :
       - le mois en cours y figure  ->  badge « À l'ardoise en ce moment »
                                        et la pizza remonte en premier ;
       - sinon                      ->  mention « Reviendra … », photo
                                        atténuée, pas d'effet au survol.

     POUR CHANGER LA PÉRIODE D'UNE PIZZA : il suffit de modifier les
     chiffres de son data-mois, dans index.html ET dans pizzeria.html.
     Aucune autre manipulation n'est nécessaire : le site se remet à
     jour tout seul au changement de mois.
     ================================================================= */
  const momentCards = [...document.querySelectorAll('.moment-card[data-mois]')];
  if (momentCards.length) {
    const moisCourant = new Date().getMonth() + 1;
    const NOMS_MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                       'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

    const moisDe = (card) => card.dataset.mois
      .split(',')
      .map(n => parseInt(n.trim(), 10))
      .filter(n => n >= 1 && n <= 12);

    // Garde-fou : si aucune pizza ne correspond au mois en cours, on
    // n'affiche RIEN du tout — ni badge, ni grisage, ni mention de retour.
    // Les cartes restent exactement comme avant l'ajout de ce système.
    // Une grille intégralement grisée serait pire que l'état d'origine.
    const auMoinsUneDispo = momentCards.some(c => moisDe(c).includes(moisCourant));

    if (auMoinsUneDispo) {
      momentCards.forEach(card => {
        const mois = moisDe(card);
        if (!mois.length) return; // data-mois vide ou mal saisi : on ne touche à rien

        const badge = card.querySelector('.badge');
        if (!badge) return;
        badge.classList.remove('badge-moment');

        if (mois.includes(moisCourant)) {
          card.classList.add('est-dispo');
          card.style.order = '-1'; // la pizza disponible passe en tête de grille
          badge.classList.add('badge-dispo');
          badge.textContent = 'À l’ardoise en ce moment';
        } else {
          card.classList.add('hors-saison');
          badge.classList.add('badge-attente');
          // Formulation tournée vers le rendez-vous, pas vers l'absence :
          // « À l'ardoise dès août » si la pizza arrive plus tard cette
          // année, « Retour en avril » si sa saison est déjà passée.
          const premier = mois[0];
          badge.textContent = (premier > moisCourant ? 'À l’ardoise dès ' : 'Retour en ')
            + NOMS_MOIS[premier - 1];
        }
      });
    }
  }

  /* ---- Contact form: show/hide devis fields ---- */
  const sujetSelect = document.getElementById('sujet');
  const devisFields = document.getElementById('devis-fields');
  if (sujetSelect && devisFields) {
    sujetSelect.addEventListener('change', () => {
      const val = sujetSelect.value;
      const showDevis = ['devis-traiteur', 'evenement-prive', 'evenement-entreprise'].includes(val);
      devisFields.style.display = showDevis ? 'block' : 'none';
    });
  }

  /* ---- Google Maps click-to-load (RGPD) ---- */
  const mapPlaceholder = document.getElementById('map-placeholder');
  if (mapPlaceholder) {
    const loadMap = () => {
      const container = mapPlaceholder.parentElement;
      container.innerHTML = '<iframe src="https://maps.google.com/maps?q=271+Cours+Fernande+Peyre,+84800+L\'Isle-sur-la-Sorgue,+France&t=&z=16&ie=UTF8&iwloc=&output=embed" width="100%" height="280" style="border:0; display:block;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Enzo Pizza — 271 Cours Fernande Peyre, L\'Isle-sur-la-Sorgue"></iframe>';
    };
    mapPlaceholder.addEventListener('click', loadMap);
    mapPlaceholder.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadMap(); }
    });
  }

  /* ---- Contact form: AJAX submit via Web3Forms ---- */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;

      if (btn.disabled) return;
      btn.disabled = true;
      btn.textContent = 'Envoi en cours\u2026';

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: new FormData(form)
        });
        const data = await response.json();

        if (data.success) {
          btn.textContent = 'Message envoy\u00e9 !';
          btn.style.background = 'var(--olive)';
          form.reset();
          if (devisFields) devisFields.style.display = 'none';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
          }, 4000);
        } else {
          throw new Error(data.message);
        }
      } catch {
        btn.textContent = 'Erreur \u2014 r\u00e9essayez';
        btn.style.background = 'var(--blush)';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      }
    });
  }

  /* ---- Parallax subtle on hero images (desktop only — transforms break iOS compositing) ---- */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  const isDesktop = window.matchMedia('(min-width: 861px) and (hover: hover)').matches;
  if (parallaxEls.length && isDesktop && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          parallaxEls.forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.15;
            const rect = el.getBoundingClientRect();
            if (rect.bottom > 0 && rect.top < window.innerHeight) {
              const offset = (scrollY - el.offsetTop) * speed;
              const img = el.querySelector('img');
              if (img) {
                img.style.transform = `translateY(${offset}px) scale(1.03)`;
              }
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---- Menu categories: simple fade-in per category ---- */

  /* ---- Scroll progress bar ---- */
  const scrollProgress = document.querySelector('.scroll-progress');
  if (scrollProgress) {
    window.addEventListener('scroll', () => {
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;
      scrollProgress.style.width = `${scrolled}%`;
    }, { passive: true });
  }

  /* ---- Animated counters ---- */
  const counters = document.querySelectorAll('.counter-animated');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = counter.dataset.count;
          const suffix = counter.dataset.suffix || '';

          // Check if target is a number
          const isNumber = !isNaN(parseFloat(target));

          if (isNumber) {
            const targetValue = parseFloat(target);
            const duration = 2000;
            const increment = targetValue / (duration / 16);
            let current = 0;

            const updateCounter = () => {
              current += increment;
              if (current < targetValue) {
                counter.textContent = Math.floor(current) + suffix;
                requestAnimationFrame(updateCounter);
              } else {
                counter.textContent = targetValue + suffix;
              }
            };
            updateCounter();
          } else {
            // If not a number, just display the value
            counter.textContent = target;
          }

          counterObserver.unobserve(counter);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
  }

  /* ---- Add hover effect to cards with mouse follow (desktop only) ---- */
  const tiltCards = document.querySelectorAll('.img-tilt');
  if (!window.matchMedia('(hover: hover)').matches) { /* skip on touch devices */ }
  else tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  });

  /* ---- Smooth button ripple effect ---- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple-effect');

      this.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  });

});
