/* js/content.js — Dynamic content from Supabase Centre de Controle.
   Loaded with defer on every page.  If the fetch fails or returns
   unexpected data, the static HTML stays intact — zero visible error. */
(function () {
  'use strict';

  var SB  = 'https://dboiktvuuzimvoukmfen.supabase.co';
  var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRib2lrdHZ1dXppbXZvdWttZmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NjUzNDIsImV4cCI6MjEwNDU0MTM0Mn0.TKu7hNo4rmcuQeCEUAOBv2Nz5dKm4vjl6PcIhfivxN4';

  /* ── DOM helpers ─────────────────────────────────────────────── */
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }
  function $(s, c)  { return (c || document).querySelector(s); }

  /* ── HTML escaping ───────────────────────────────────────────── */
  var E = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
  function esc(s) { return typeof s === 'string' ? s.replace(/[&<>"']/g, function(c){return E[c]}) : ''; }

  /* ── Phone helpers ───────────────────────────────────────────── */
  function telHref(p) { return 'tel:' + p.replace(/\s+/g, ''); }
  function telE164(p) { var n = p.replace(/\s+/g, ''); return n[0] === '0' ? '+33' + n.slice(1) : n; }

  /* ── Price formatting (fr-FR) ────────────────────────────────── */
  function fmtPrice(price, note) {
    if (price == null) return note ? esc(note) : '\u2014';
    var s = price.toFixed(2).replace('.', ',') + '\u00a0\u20ac';
    return note ? s + ' ' + esc(note) : s;
  }
  function fmtSup(p) {
    return (p % 1 === 0 ? String(p) : p.toFixed(2).replace('.', ',')) + '\u00a0\u20ac';
  }

  /* ── Badge rendering ─────────────────────────────────────────── */
  var BDG = {
    veggie:          ['badge-veggie', 'Veggie'],
    epice:           ['badge-spicy', '\u00c9pic\u00e9'],
    'coup-de-coeur': ['badge-fav',   'Coup de c\u0153ur']
  };
  function badges(tags) {
    return (tags || []).map(function(t) {
      var b = BDG[t]; return b ? ' <span class="badge ' + b[0] + '">' + b[1] + '</span>' : '';
    }).join('');
  }

  /* ── formatHours ───────────────────────────────────────────────
     Groups days by schedule, majority first.  When a group covers
     5+ days it renders as "Tous les jours" with "sauf" exceptions. */
  var DAYS  = ['mon','tue','wed','thu','fri','sat','sun'];
  var DAY_L = {mon:'Lundi',tue:'Mardi',wed:'Mercredi',thu:'Jeudi',
               fri:'Vendredi',sat:'Samedi',sun:'Dimanche'};
  var DAY_E = {mon:'Monday',tue:'Tuesday',wed:'Wednesday',thu:'Thursday',
               fri:'Friday',sat:'Saturday',sun:'Sunday'};

  function ft(t)  { var p = t.split(':'); return p[1] === '00' ? p[0] + 'h' : p[0] + 'h' + p[1]; }
  function dk(d)  { return d.closed ? 'X' : d.slots.map(function(s){return s.open+'-'+s.close}).sort().join('|'); }
  function fs(sl) { return sl.map(function(s){return ft(s.open)+'\u2013'+ft(s.close)}).join(', '); }

  /* Day-list label: first name capitalised, rest lowercase */
  function dl(days) {
    if (days.length === 1) return DAY_L[days[0]];
    var ix = days.map(function(d){return DAYS.indexOf(d)}).sort(function(a,b){return a-b});
    if (ix.every(function(v,i){return !i || v === ix[i-1]+1}) && days.length >= 3) {
      var s = ix.map(function(i){return DAYS[i]});
      return DAY_L[s[0]] + ' \u00e0 ' + DAY_L[s[s.length-1]].toLowerCase();
    }
    return days.map(function(d, i) {
      return i === 0 ? DAY_L[d] : DAY_L[d].toLowerCase();
    }).join(days.length === 2 ? ' & ' : ', ');
  }

  /* All-lowercase day list (for "sauf" exception lines) */
  function dlLower(days) {
    var names = days.map(function(d) { return DAY_L[d].toLowerCase(); });
    if (names.length === 1) return names[0];
    return names.length === 2 ? names[0] + ' & ' + names[1] : names.join(', ');
  }

  function formatHours(hours) {
    /* merge all days sharing the same schedule (non-consecutive too) */
    var m = {}, o = [];
    DAYS.forEach(function(d) {
      var h = hours[d], k = dk(h);
      if (m[k]) m[k].d.push(d);
      else { m[k] = {d: [d], h: h}; o.push(k); }
    });
    /* sort groups: largest first */
    o.sort(function(a, b) { return m[b].d.length - m[a].d.length; });

    /* single group → "Tous les jours" */
    if (o.length === 1) {
      var g = m[o[0]];
      return g.h.closed
        ? ['Ferm\u00e9 tous les jours']
        : ['Tous les jours\u00a0: ' + fs(g.h.slots)];
    }

    /* majority (5+ days) → "Tous les jours" + "sauf …" exceptions */
    var major = m[o[0]];
    if (major.d.length >= 5) {
      var lines = [major.h.closed
        ? 'Ferm\u00e9 tous les jours'
        : 'Tous les jours\u00a0: ' + fs(major.h.slots)];
      for (var i = 1; i < o.length; i++) {
        var x = m[o[i]], dn = dlLower(x.d);
        lines.push(x.h.closed
          ? 'sauf ' + dn + '\u00a0: ferm\u00e9'
          : 'sauf ' + dn + '\u00a0: ' + fs(x.h.slots));
      }
      return lines;
    }

    /* fallback: list each group normally */
    return o.map(function(k) {
      var x = m[k], n = dl(x.d);
      return x.h.closed ? n + '\u00a0: ferm\u00e9' : n + '\u00a0: ' + fs(x.h.slots);
    });
  }

  /* ── JSON-LD: openingHoursSpecification builder ──────────────── */
  function buildOHS(hours) {
    var g = {}, o = [];
    DAYS.forEach(function(d) {
      var h = hours[d]; if (h.closed) return;
      h.slots.forEach(function(s) {
        var k = s.open + '-' + s.close;
        if (!g[k]) { g[k] = {dw: [], open: s.open, close: s.close}; o.push(k); }
        g[k].dw.push(DAY_E[d]);
      });
    });
    return o.map(function(k) {
      return {'@type': 'OpeningHoursSpecification', dayOfWeek: g[k].dw, opens: g[k].open, closes: g[k].close};
    });
  }

  /* ────────────────────────────────────────────────────────────── */
  /*  APPLY FUNCTIONS                                              */
  /* ────────────────────────────────────────────────────────────── */

  /* ── Specials (/ and /pizzeria) ──────────────────────────────── */
  function applySpecials(data) {
    var items = (data.items || []).filter(function(s) { return s.active; });
    $$('[data-content="specials"]').forEach(function(el) {
      var section = el.closest('.menu-category, section, article') || el.parentElement;
      if (!items.length) { section.style.display = 'none'; return; }
      section.style.display = '';
      el.innerHTML = items.map(function(s) {
        return '<article class="moment-card">' +
          '<div class="moment-card-media">' +
            (s.imageUrl
              ? '<img src="' + esc(s.imageUrl) + '" alt="' + esc(s.name) + ' \u2014 Enzo Pizza" width="1200" height="1400" loading="lazy">'
              : '') +
          '</div><div class="moment-card-body">' +
            '<span class="badge badge-moment">' + esc(s.season) + '</span>' +
            '<h3 class="moment-card-name">' + esc(s.name) + '</h3>' +
            '<p class="moment-card-desc">' + esc(s.description) + '</p>' +
          '</div></article>';
      }).join('');
    });
  }

  /* ── Menu nav (/pizzeria sidebar) ────────────────────────────── */
  function applyMenuNav(specials, menu) {
    var nav = $('[data-content="menu-nav"]');
    if (!nav) return;
    var active = (specials.items || []).filter(function(s) { return s.active; });
    var h = '';
    if (active.length) {
      h = '<a href="#moment" class="menu-nav-item active" data-target="moment">' +
          '<span>Pizzas du moment</span><span class="count">' + active.length + '</span></a>';
    }
    (menu.categories || []).forEach(function(c, i) {
      var first = !active.length && i === 0;
      h += '<a href="#' + esc(c.id) + '" class="menu-nav-item' + (first ? ' active' : '') + '" data-target="' + esc(c.id) + '">' +
           '<span>' + esc(c.name) + '</span><span class="count">' + c.items.length + '</span></a>';
    });
    nav.innerHTML = h;
  }

  /* ── Menu body (/pizzeria categories + supplements) ──────────── */
  function applyMenuBody(menu) {
    var w = $('[data-content="menu"]');
    if (!w) return;
    $$('.menu-category:not(#moment)', w).forEach(function(e) { e.remove(); });
    var old = $('.supplements', w); if (old) old.remove();

    var frag = document.createDocumentFragment();
    (menu.categories || []).forEach(function(cat) {
      var d = document.createElement('div');
      d.className = 'menu-category reveal visible';
      d.id = cat.id;
      d.innerHTML =
        '<div class="menu-category-head"><h2>' + esc(cat.name) + '</h2>' +
        '<span class="menu-cat-note">' + esc(cat.tagline) + '</span></div>' +
        cat.items.map(function(it) {
          var u = it.available === false;
          return '<div class="menu-item' + (u ? ' menu-item--unavailable' : '') + '"><div>' +
            '<div class="menu-item-name">' + esc(it.name) + badges(it.tags) +
              (u ? ' <span class="unavailable-tag">Indisponible ce soir</span>' : '') +
            '</div>' +
            '<p class="menu-item-desc">' + esc(it.description) + '</p>' +
            '</div><div class="menu-item-price">' + fmtPrice(it.price, it.priceNote) + '</div></div>';
        }).join('');
      frag.appendChild(d);
    });

    if (menu.supplements && menu.supplements.length) {
      var s = document.createElement('div');
      s.className = 'supplements reveal visible';
      s.innerHTML = '<span class="eyebrow">Suppl\u00e9ments</span>' +
        menu.supplements.map(function(x) {
          return '<span><strong>' + esc(x.name) + '</strong> ' + fmtSup(x.price) + '</span>';
        }).join('');
      frag.appendChild(s);
    }
    w.appendChild(frag);
  }

  /* ── Infos (address, hours, phones, faq, footer, JSON-LD) ───── */
  function applyInfos(infos) {
    var a = infos.address;
    var lines = formatHours(infos.hours);
    var linesH = lines.map(esc);

    /* address blocks */
    $$('[data-content="address"]').forEach(function(el) {
      var p = $('p', el);
      if (p) p.innerHTML = esc(a.line1) + '<br>' + esc(a.postalCode) + ' ' + esc(a.city);
    });

    /* hours blocks */
    $$('[data-content="hours"]').forEach(function(el) {
      var p = $('p', el);
      if (p) p.innerHTML = linesH.join('<br>');
    });

    /* phones blocks (pizzeria phone + booking note) */
    $$('[data-content="phones"]').forEach(function(el) {
      var p = $('p', el);
      if (p) p.innerHTML = '<a href="' + esc(telHref(infos.phonePizzeria)) +
        '" class="link-underline" style="color:var(--camel-deep)">' +
        esc(infos.phonePizzeria) + '</a><br>' + esc(infos.bookingNote);
    });

    /* FAQ hours */
    $$('[data-content="faq-hours"]').forEach(function(el) {
      var p = $('p', el);
      if (p) p.innerHTML = linesH.join('. ') +
        '. R\u00e9servation\u00a0: ' + esc(infos.bookingNote.toLowerCase()) + '.';
    });

    /* contact page: Enzo card */
    $$('[data-content="contact-enzo"]').forEach(function(el) {
      el.innerHTML =
        '<p>' + esc(a.line1) + '<br>' + esc(a.postalCode) + ' ' + esc(a.city) + '</p>' +
        '<p>T\u00e9l\u00e9phone\u00a0: <a href="' + esc(telHref(infos.phonePizzeria)) + '">' +
          esc(infos.phonePizzeria) + '</a></p>' +
        '<p>R\u00e9servation ' + esc(infos.bookingNote.toLowerCase()) + '</p>';
    });

    /* contact page: NOTI card */
    $$('[data-content="contact-noti"]').forEach(function(el) {
      var lk = $('a[href^="tel:"]', el);
      if (lk) { lk.href = telHref(infos.phoneTraiteur); lk.textContent = infos.phoneTraiteur; }
    });

    /* contact page: hours card */
    $$('[data-content="contact-hours"]').forEach(function(el) {
      var ps = $$('p', el);
      if (ps[0]) ps[0].innerHTML =
        '<strong style="color:var(--blush)">Enzo Pizza</strong><br>' + linesH.join('<br>');
    });

    /* footer: Enzo col */
    $$('[data-content="footer-enzo"]').forEach(function(el) {
      var ps = $$('p', el);
      var lk = $('a[href^="tel:"]', el);
      if (ps[0]) ps[0].textContent = a.line1;
      if (ps[1]) ps[1].textContent = a.postalCode + ' ' + a.city;
      if (lk) { lk.href = telHref(infos.phonePizzeria); lk.textContent = infos.phonePizzeria; }
    });

    /* footer: NOTI col */
    $$('[data-content="footer-noti"]').forEach(function(el) {
      var lk = $('a[href^="tel:"]', el);
      if (lk) { lk.href = telHref(infos.phoneTraiteur); lk.textContent = infos.phoneTraiteur; }
    });

    /* announcement banner */
    $$('[data-content="announcement"]').forEach(function(el) {
      if (infos.announcement && infos.announcement.trim()) {
        el.innerHTML = '<div class="announcement-banner">' + esc(infos.announcement) + '</div>';
        el.style.display = 'block';
      }
    });

    /* JSON-LD: Restaurant / LocalBusiness */
    var jld = $('#jsonld-restaurant');
    if (jld) {
      try {
        var d = JSON.parse(jld.textContent);
        if (d.address) {
          d.address.streetAddress = a.line1;
          d.address.addressLocality = a.city;
          d.address.postalCode = a.postalCode;
        }
        d.telephone = telE164(infos.phonePizzeria);
        d.openingHoursSpecification = buildOHS(infos.hours);
        jld.textContent = JSON.stringify(d, null, 2);
      } catch (e) { /* keep original */ }
    }

    /* JSON-LD: CateringService (traiteur) */
    var cat = $('#jsonld-catering');
    if (cat) {
      try {
        var dc = JSON.parse(cat.textContent);
        dc.telephone = telE164(infos.phoneTraiteur);
        cat.textContent = JSON.stringify(dc, null, 2);
      } catch (e) { /* keep original */ }
    }

    /* JSON-LD: FAQ (hours question) */
    var faq = $('#jsonld-faq');
    if (faq) {
      try {
        var df = JSON.parse(faq.textContent);
        (df.mainEntity || []).forEach(function(q) {
          if (q.name && q.name.indexOf('horaires') !== -1) {
            q.acceptedAnswer.text = lines.join('. ') +
              '. R\u00e9servation\u00a0: ' + infos.bookingNote.toLowerCase() + '.';
          }
        });
        faq.textContent = JSON.stringify(df, null, 2);
      } catch (e) { /* keep original */ }
    }
  }

  /* ── Rebind scroll spy + smooth scroll after menu rebuild ────── */
  function rebindMenu() {
    var navItems = $$('.menu-nav-item');
    var cats = $$('.menu-category');
    if (!navItems.length || !cats.length) return;

    var spy = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navItems.forEach(function(item) {
          item.classList.toggle('active', item.getAttribute('href') === '#' + id);
        });
      });
    }, {threshold: 0.1, rootMargin: '-100px 0px -60% 0px'});
    cats.forEach(function(c) { spy.observe(c); });

    var header = $('.site-header');
    navItems.forEach(function(a) {
      a.addEventListener('click', function(e) {
        var tgt = $(a.getAttribute('href'));
        if (tgt) {
          e.preventDefault();
          var off = header ? header.offsetHeight + 16 : 80;
          window.scrollTo({top: tgt.getBoundingClientRect().top + window.scrollY - off, behavior: 'smooth'});
        }
      });
    });
  }

  /* ── Inject minimal CSS for dynamic-only states ──────────────── */
  function injectStyles() {
    var s = document.createElement('style');
    s.textContent =
      '.menu-item--unavailable{opacity:.45}' +
      '.unavailable-tag{display:inline-block;font-size:.72rem;color:var(--ink-faint);' +
        'font-style:italic;margin-left:.4rem;font-weight:400;font-family:var(--font-body)}' +
      '.announcement-banner{background:var(--camel);color:var(--bg);text-align:center;' +
        'padding:.5rem 1rem;font-size:.85rem;font-weight:500;letter-spacing:.01em}' +
      '[data-content="announcement"]{display:none}';
    document.head.appendChild(s);
  }

  /* ── Fetch & apply ───────────────────────────────────────────── */
  injectStyles();

  fetch(SB + '/rest/v1/rpc/get_site_content', {
    method: 'POST',
    headers: {
      'apikey': KEY,
      'Authorization': 'Bearer ' + KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({p_slug: 'enzo-pizza'})
  })
  .then(function(r) { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(function(data) {
    if (!data || typeof data !== 'object') return;
    try { if (data.specials) applySpecials(data.specials); }
    catch (e) { console.warn('[content] specials: ' + e.message); }
    try { if (data.specials && data.menu) applyMenuNav(data.specials, data.menu); }
    catch (e) { console.warn('[content] menu-nav: ' + e.message); }
    try { if (data.menu) applyMenuBody(data.menu); }
    catch (e) { console.warn('[content] menu: ' + e.message); }
    try { if (data.infos) applyInfos(data.infos); }
    catch (e) { console.warn('[content] infos: ' + e.message); }
    rebindMenu();
  })
  .catch(function(err) { console.warn('[content] ' + err.message); });

})();
