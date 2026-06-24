/* ============================================
   ENZO PIZZA & MAISON NOTI — Shared JS v3
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile nav toggle ---- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        links.classList.remove('open');
      });
    });
  }

  /* ---- Active nav link ---- */
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a:not(.nav-cta)').forEach(a => {
    a.classList.remove('active');
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
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

  /* ---- Contact form: submit simulation ---- */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Message envoy\u00e9 !';
      btn.style.background = 'var(--olive)';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
        if (devisFields) devisFields.style.display = 'none';
      }, 3000);
    });
  }

  /* ---- Parallax subtle on hero images ---- */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
              el.style.transform = `translateY(${offset}px)`;
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---- Staggered reveal for menu items ---- */
  const menuItems = document.querySelectorAll('.menu-item');
  if (menuItems.length && 'IntersectionObserver' in window) {
    const menuObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateX(0)';
          menuObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    menuItems.forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-8px)';
      item.style.transition = `opacity 0.4s ${i * 0.03}s var(--ease-out-expo), transform 0.4s ${i * 0.03}s var(--ease-out-expo)`;
      menuObserver.observe(item);
    });
  }

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

  /* ---- Add hover effect to cards with mouse follow ---- */
  const tiltCards = document.querySelectorAll('.img-tilt');
  tiltCards.forEach(card => {
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
