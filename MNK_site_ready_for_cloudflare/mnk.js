/* ============================================================
   MNK Marine Consultants LLC — behaviour  (v2)
   ============================================================ */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     CONFIG — Quote form delivery
     Quote requests POST to a Cloudflare Pages Function (see
     functions/send-quote.js → route /send-quote) that emails via
     Resend, reading RESEND_API_KEY from context.env. While that key
     is unset the endpoint is DORMANT (responds 503) and the form
     gracefully falls back to a pre-filled mailto — so it stays
     usable now with no account, and goes live the moment the key
     is added in the Cloudflare dashboard. No front-end change needed.
     --------------------------------------------------------- */
  var QUOTE_ENDPOINT = '/send-quote';
  var OWNER_EMAIL    = 'mnkmarineconsultants1@gmail.com';

  /* ---------------------------------------------------------
     1 · BLUEPRINT SHIP ART  (technical line drawings, no waterline)
     viewBox 0 0 240 78 · deck baseline y=44
     --------------------------------------------------------- */
  var SHIPS = {
    bulk: {
      label: 'Bulk Carrier',
      svg:
      '<svg viewBox="0 0 240 78">' +
      '<path class="fillship" d="M8,44 L8,56 Q8,60 12,60 L150,60 L184,57 Q210,54 233,44 Z"/>' +
      '<line x1="11" y1="50" x2="228" y2="50"/>' +
      '<line x1="12" y1="55" x2="176" y2="55"/>' +
      '<circle cx="52" cy="47" r="1"/><circle cx="64" cy="47" r="1"/><circle cx="76" cy="47" r="1"/><circle cx="88" cy="47" r="1"/><circle cx="100" cy="47" r="1"/><circle cx="112" cy="47" r="1"/><circle cx="124" cy="47" r="1"/><circle cx="136" cy="47" r="1"/>' +
      '<line x1="14" y1="43" x2="226" y2="43"/>' +
      // aft superstructure (left) — windowed tiers
      '<path d="M14,43 L14,30 L48,30 L48,43"/><line x1="14" y1="36.5" x2="48" y2="36.5"/>' +
      '<rect x="17" y="32" width="3.4" height="2.4"/><rect x="24" y="32" width="3.4" height="2.4"/><rect x="31" y="32" width="3.4" height="2.4"/><rect x="38" y="32" width="3.4" height="2.4"/>' +
      '<rect x="17" y="38.5" width="3.4" height="2.4"/><rect x="24" y="38.5" width="3.4" height="2.4"/><rect x="31" y="38.5" width="3.4" height="2.4"/><rect x="38" y="38.5" width="3.4" height="2.4"/>' +
      '<path d="M22,30 L22,23 L40,23 L40,30"/><rect x="25" y="25" width="3" height="2.4"/><rect x="32" y="25" width="3" height="2.4"/>' +
      // funnel with band + mast & yard
      '<path d="M28,23 L29,13 L37,13 L38,23 Z"/><line x1="29" y1="17" x2="37" y2="17"/>' +
      '<line x1="45" y1="23" x2="45" y2="7"/><line x1="39" y1="13" x2="51" y2="13"/>' +
      // four hatch covers (cross-braced)
      '<path d="M62,43 L62,39 L84,39 L84,43"/><path d="M62,39 L84,43 M84,39 L62,43"/>' +
      '<path d="M96,43 L96,39 L118,39 L118,43"/><path d="M96,39 L118,43 M118,39 L96,43"/>' +
      '<path d="M130,43 L130,39 L152,39 L152,43"/><path d="M130,39 L152,43 M152,39 L130,43"/>' +
      // two deck cranes (lattice pedestal + jib + hoist)
      '<line x1="88" y1="43" x2="88" y2="29"/><line x1="92" y1="43" x2="92" y2="29"/><line x1="88" y1="33" x2="92" y2="31"/><line x1="88" y1="37" x2="92" y2="35"/><path d="M88,29 L112,35"/><line x1="112" y1="35" x2="112" y2="41"/>' +
      '<line x1="122" y1="43" x2="122" y2="29"/><line x1="126" y1="43" x2="126" y2="29"/><line x1="122" y1="33" x2="126" y2="31"/><line x1="122" y1="37" x2="126" y2="35"/><path d="M122,29 L146,35"/><line x1="146" y1="35" x2="146" y2="41"/>' +
      // bow mast with stays + forecastle
      '<line x1="196" y1="43" x2="196" y2="24"/><line x1="196" y1="24" x2="214" y2="40"/><line x1="196" y1="24" x2="182" y2="38"/><line x1="190" y1="30" x2="202" y2="30"/>' +
      '<path d="M214,43 L214,40 L228,40"/>' +
      '</svg>'
    },
    lgc: {
      label: 'LGC Carrier',
      svg:
      '<svg viewBox="0 0 240 78">' +
      '<path class="fillship" d="M8,44 L8,56 Q8,60 12,60 L150,60 L184,57 Q210,54 233,44 Z"/>' +
      '<line x1="11" y1="50" x2="228" y2="50"/>' +
      '<line x1="12" y1="55" x2="176" y2="55"/>' +
      '<line x1="14" y1="43" x2="226" y2="43"/>' +
      // aft house + funnel + mast
      '<path d="M14,43 L14,28 L44,28 L44,43"/><line x1="14" y1="34" x2="44" y2="34"/>' +
      '<rect x="17" y="30" width="3.2" height="2.4"/><rect x="23" y="30" width="3.2" height="2.4"/><rect x="29" y="30" width="3.2" height="2.4"/><rect x="35" y="30" width="3.2" height="2.4"/>' +
      '<path d="M20,28 L20,22 L38,22 L38,28"/><rect x="23" y="24" width="3" height="2.2"/><rect x="31" y="24" width="3" height="2.2"/>' +
      '<path d="M24,22 L25,14 L33,14 L34,22 Z"/><line x1="25" y1="17" x2="33" y2="17"/>' +
      '<line x1="42" y1="28" x2="42" y2="12"/><line x1="36" y1="16" x2="48" y2="16"/>' +
      // pipe manifold deck run
      '<line x1="58" y1="43" x2="172" y2="43"/><line x1="58" y1="45" x2="172" y2="45"/>' +
      // spherical gas tanks: saddle + dome riser
      '<circle cx="80" cy="33" r="13"/><path d="M71,43 Q80,46 89,43"/><line x1="80" y1="20" x2="80" y2="17"/><rect x="78" y="15" width="4" height="2.4"/>' +
      '<circle cx="112" cy="33" r="13"/><path d="M103,43 Q112,46 121,43"/><line x1="112" y1="20" x2="112" y2="17"/><rect x="110" y="15" width="4" height="2.4"/>' +
      '<circle cx="144" cy="33" r="13"/><path d="M135,43 Q144,46 153,43"/><line x1="144" y1="20" x2="144" y2="17"/><rect x="142" y="15" width="4" height="2.4"/>' +
      // bow mast + forecastle
      '<line x1="196" y1="43" x2="196" y2="26"/><line x1="196" y1="26" x2="214" y2="40"/><line x1="196" y1="26" x2="184" y2="38"/>' +
      '<path d="M210,43 L210,40 L226,40"/>' +
      '</svg>'
    },
    tug: {
      label: 'Harbour Tug',
      svg:
      '<svg viewBox="0 0 240 78">' +
      // stout hull, raised bow (right), with fender
      '<path class="fillship" d="M58,40 L58,56 Q58,60 62,60 L150,60 L182,38 L182,40 Z"/>' +
      '<line x1="62" y1="50" x2="176" y2="50"/>' +
      '<path d="M178,40 Q185,43 182,49 Q179,53 173,55"/>' +
      '<circle cx="96" cy="47" r="1"/><circle cx="108" cy="47" r="1"/><circle cx="120" cy="47" r="1"/>' +
      // aft bulwark
      '<path d="M62,40 L62,34 L88,34 L88,40"/><line x1="62" y1="37" x2="88" y2="37"/>' +
      // main deckhouse with windows
      '<path d="M84,40 L84,24 L120,24 L120,40"/><line x1="84" y1="31" x2="120" y2="31"/>' +
      '<rect x="88" y="26" width="3.6" height="3"/><rect x="96" y="26" width="3.6" height="3"/><rect x="104" y="26" width="3.6" height="3"/><rect x="112" y="26" width="3.6" height="3"/>' +
      // wheelhouse + windows
      '<path d="M92,24 L92,16 L114,16 L114,24"/><rect x="95" y="18" width="3.6" height="3.4"/><rect x="101" y="18" width="3.6" height="3.4"/><rect x="107" y="18" width="3.6" height="3.4"/>' +
      // mast + radar + crosstree
      '<line x1="103" y1="16" x2="103" y2="6"/><line x1="97" y1="10" x2="109" y2="10"/><rect x="99" y="3" width="8" height="2"/>' +
      // funnel with band
      '<path d="M120,40 L121,28 L131,28 L132,40 Z"/><line x1="121" y1="32" x2="131" y2="32"/>' +
      // towing winch (aft) + bitt
      '<circle cx="74" cy="37" r="3"/><line x1="71" y1="37" x2="77" y2="37"/><line x1="68" y1="34" x2="68" y2="40"/>' +
      '<path d="M134,40 L134,36 L150,36 L150,40"/>' +
      '</svg>'
    },
    osv: {
      label: 'Offshore Support Vessel',
      svg:
      '<svg viewBox="0 0 240 78">' +
      '<path class="fillship" d="M8,44 L8,56 Q8,60 12,60 L150,60 L184,57 Q210,54 233,44 Z"/>' +
      '<line x1="11" y1="50" x2="228" y2="50"/>' +
      '<line x1="12" y1="55" x2="176" y2="55"/>' +
      '<line x1="14" y1="43" x2="150" y2="43"/>' +
      // forward bridge block (right) — multi-tier, many windows
      '<path d="M150,43 L150,22 L196,22 L196,43"/><line x1="150" y1="29" x2="196" y2="29"/><line x1="150" y1="36" x2="196" y2="36"/>' +
      '<rect x="154" y="24" width="3.6" height="3"/><rect x="161" y="24" width="3.6" height="3"/><rect x="168" y="24" width="3.6" height="3"/><rect x="175" y="24" width="3.6" height="3"/><rect x="182" y="24" width="3.6" height="3"/>' +
      '<rect x="154" y="31" width="3.6" height="3"/><rect x="161" y="31" width="3.6" height="3"/><rect x="168" y="31" width="3.6" height="3"/><rect x="175" y="31" width="3.6" height="3"/><rect x="182" y="31" width="3.6" height="3"/>' +
      '<path d="M160,22 L160,15 L186,15 L186,22"/><rect x="164" y="17" width="3.4" height="3"/><rect x="171" y="17" width="3.4" height="3"/><rect x="178" y="17" width="3.4" height="3"/>' +
      '<line x1="173" y1="15" x2="173" y2="7"/><line x1="167" y1="10" x2="179" y2="10"/>' +
      // aft A-frame + deck crane + cable reels on long working deck
      '<path d="M40,43 L34,15 M60,43 L66,15 M34,15 L66,15"/><line x1="50" y1="15" x2="50" y2="7"/><line x1="50" y1="15" x2="50" y2="30"/>' +
      '<line x1="96" y1="43" x2="96" y2="26"/><line x1="100" y1="43" x2="100" y2="26"/><path d="M96,26 L122,33"/><line x1="122" y1="33" x2="122" y2="41"/>' +
      '<circle cx="78" cy="39" r="3.4"/><circle cx="88" cy="39" r="3.4"/>' +
      '<path d="M214,43 L214,40 L228,40"/>' +
      '</svg>'
    },
    container: {
      label: 'Container Ship',
      svg:
      '<svg viewBox="0 0 240 78">' +
      '<path class="fillship" d="M8,44 L8,56 Q8,60 12,60 L150,60 L184,57 Q210,54 233,44 Z"/>' +
      '<line x1="11" y1="50" x2="228" y2="50"/>' +
      '<line x1="12" y1="55" x2="176" y2="55"/>' +
      '<circle cx="196" cy="47" r="1"/><circle cx="206" cy="47" r="1"/><circle cx="216" cy="47" r="1"/>' +
      '<line x1="14" y1="43" x2="226" y2="43"/>' +
      // aft house + funnel + mast
      '<path d="M14,43 L14,26 L40,26 L40,43"/><line x1="14" y1="32" x2="40" y2="32"/><line x1="14" y1="38" x2="40" y2="38"/>' +
      '<rect x="17" y="28" width="3" height="2.2"/><rect x="23" y="28" width="3" height="2.2"/><rect x="29" y="28" width="3" height="2.2"/><rect x="35" y="28" width="3" height="2.2"/>' +
      '<path d="M20,26 L20,20 L34,20 L34,26"/>' +
      '<path d="M24,20 L25,12 L31,12 L32,20 Z"/><line x1="25" y1="15" x2="31" y2="15"/>' +
      '<line x1="38" y1="26" x2="38" y2="12"/><line x1="33" y1="16" x2="43" y2="16"/>' +
      // container block — grid of cells
      '<rect x="48" y="24" width="140" height="19"/>' +
      '<line x1="48" y1="30.3" x2="188" y2="30.3"/><line x1="48" y1="36.6" x2="188" y2="36.6"/>' +
      '<line x1="62" y1="24" x2="62" y2="43"/><line x1="76" y1="24" x2="76" y2="43"/><line x1="90" y1="24" x2="90" y2="43"/><line x1="104" y1="24" x2="104" y2="43"/><line x1="118" y1="24" x2="118" y2="43"/><line x1="132" y1="24" x2="132" y2="43"/><line x1="146" y1="24" x2="146" y2="43"/><line x1="160" y1="24" x2="160" y2="43"/><line x1="174" y1="24" x2="174" y2="43"/>' +
      // bow mast + forecastle
      '<line x1="200" y1="43" x2="200" y2="28"/><line x1="200" y1="28" x2="216" y2="40"/><line x1="200" y1="28" x2="190" y2="38"/>' +
      '<path d="M214,43 L214,40 L228,40"/>' +
      '</svg>'
    }
  };

  function cell(key) {
    var s = SHIPS[key];
    return '<div class="ship-cell">' +
             '<span class="shipart">' + s.svg + '</span>' +
             '<span class="ship-cap">' + s.label + '</span>' +
           '</div>';
  }

  function buildRow(el, order, repeats) {
    var unit = '';
    for (var i = 0; i < order.length; i++) unit += cell(order[i]);
    var half = '';
    for (var r = 0; r < repeats; r++) half += unit;
    el.innerHTML = half + half;   // duplicated for seamless -50% loop
  }

  function initBanner() {
    var a = document.querySelector('.ship-row--a');
    var b = document.querySelector('.ship-row--b');
    if (a) buildRow(a, ['bulk', 'lgc', 'tug', 'osv', 'container'], 3);
    if (b) buildRow(b, ['container', 'osv', 'bulk', 'tug', 'lgc'], 3);
  }

  /* ---------------------------------------------------------
     2 · NAV scrollspy  (offset by sticky-header height so the
        active tab matches the section actually in view; a click
        sets its own tab active immediately)
     --------------------------------------------------------- */
  function initNav() {
    var nav = document.querySelector('.nav');
    var tabsWrap = document.querySelector('.tabs');
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
    var map = {};
    tabs.forEach(function (t) { map[t.getAttribute('href').slice(1)] = t; });
    var sections = tabs
      .map(function (t) { return document.getElementById(t.getAttribute('href').slice(1)); })
      .filter(Boolean);

    var current = null;
    var clickLockUntil = 0;

    function headerH() { return nav ? nav.offsetHeight : 110; }

    function setActive(id) {
      if (id === current) return;
      current = id;
      tabs.forEach(function (t) { t.classList.remove('is-active'); });
      var tab = map[id];
      if (!tab) return;
      tab.classList.add('is-active');
      if (tabsWrap) {
        var target = tab.offsetLeft - (tabsWrap.clientWidth / 2) + (tab.clientWidth / 2);
        tabsWrap.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
      }
    }

    function onScroll() {
      if (Date.now() < clickLockUntil) return;       // don't fight a click's smooth-scroll
      var line = headerH() + 40;                      // the reading line, just below the header
      var active = sections[0];
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top <= line) active = sections[i];
        else break;
      }
      // near the very bottom, force the last section active
      if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 2)) {
        active = sections[sections.length - 1];
      }
      if (active) setActive(active.id);
    }

    // clicking a tab activates it immediately and locks the spy briefly
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        clickLockUntil = Date.now() + 800;
        setActive(t.getAttribute('href').slice(1));
      });
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  /* ---------------------------------------------------------
     3 · Reveal on scroll
     --------------------------------------------------------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries, o) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (e) { obs.observe(e); });
  }

  /* ---------------------------------------------------------
     4 · Quote modal — Resend serverless function
         (graceful mailto fallback while dormant) + 500-word counter
     --------------------------------------------------------- */
  function initModal() {
    var modal = document.getElementById('quoteModal');
    if (!modal) return;
    var openers = document.querySelectorAll('[data-open-quote]');
    var closers = modal.querySelectorAll('[data-close-quote]');
    var scrim = modal.querySelector('.modal__scrim');
    var form = document.getElementById('quoteForm');
    var statusEl = document.getElementById('quoteStatus');
    var msg = form ? form.elements.services : null;
    var counter = document.getElementById('wordCount');
    var WORD_LIMIT = 500;

    function open() { modal.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
    function close() { modal.classList.remove('is-open'); document.body.style.overflow = ''; }
    function setStatus(kind, m) {
      if (!statusEl) return;
      statusEl.className = 'modal__status show ' + kind;
      statusEl.textContent = m;
    }
    function countWords(s) { var t = (s || '').trim(); return t ? t.split(/\s+/).length : 0; }
    function updateCount() {
      if (!msg || !counter) return 0;
      var n = countWords(msg.value);
      counter.textContent = n + ' / ' + WORD_LIMIT + ' words';
      counter.classList.toggle('over', n > WORD_LIMIT);
      return n;
    }
    if (msg) { msg.addEventListener('input', updateCount); updateCount(); }

    openers.forEach(function (o) {
      o.addEventListener('click', function (e) {
        e.preventDefault(); open();
        if (msg) setTimeout(function () { msg.focus(); }, 60);
      });
    });
    closers.forEach(function (c) { c.addEventListener('click', close); });
    if (scrim) scrim.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('is-open')) close(); });

    function fields(f) {
      return {
        services: (f.services.value || '').trim() || '—',
        dateFrom: f.dateFrom.value || '—',
        dateTo:   f.dateTo.value || '—',
        location: f.location.value || '—',
        name:     f.name.value || '—',
        company:  f.company.value || '—',
        email:    f.email.value || '—',
        phone:    f.phone.value || '—',
        company_website: f.company_website ? f.company_website.value : ''   // honeypot
      };
    }

    function mailtoFallback(d) {
      var lines = [
        'QUOTE REQUEST — MNK MARINE CONSULTANTS LLC',
        '----------------------------------------', '',
        'Services Required:', d.services, '',
        'Date Range:  ' + d.dateFrom + '   to   ' + d.dateTo,
        'Location of Service:  ' + d.location, '',
        'Name:     ' + d.name,
        'Company:  ' + d.company,
        'Email:    ' + d.email,
        'Phone:    ' + d.phone
      ];
      var subject = 'Quote Request — MNK Marine Consultants'.replace(/[\r\n]+/g, ' ');
      window.location.href = 'mailto:' + OWNER_EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (updateCount() > WORD_LIMIT) {
          setStatus('err', 'Please shorten the services description to ' + WORD_LIMIT + ' words or fewer.');
          if (msg) msg.focus();
          return;
        }
        var d = fields(form.elements);
        var btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
        function restore() { if (btn) { btn.disabled = false; btn.textContent = 'Send Request'; } }

        fetch(QUOTE_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(d)
        }).then(function (r) {
          if (r.ok) {
            setStatus('ok', 'Thank you — your request has been sent. We’ll be in touch shortly.');
            form.reset(); updateCount(); restore(); return;
          }
          // 503 = endpoint built but not yet activated (RESEND_API_KEY unset) → email fallback
          setStatus('ok', 'Opening your email app to send this request…');
          restore(); mailtoFallback(d);
        }).catch(function () {
          // no serverless function reachable (e.g. static preview) → email fallback
          setStatus('ok', 'Opening your email app to send this request…');
          restore(); mailtoFallback(d);
        });
      });
    }
  }

  /* ---------------------------------------------------------
     5 · TWEAKS  (host protocol + live apply)
     --------------------------------------------------------- */
  var TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "heroLayout": "centered",
    "bannerRows": "double",
    "accent": "#c0281e",
    "headFont": "Archivo",
    "shipMotion": true,
    "shipCaptions": true
  }/*EDITMODE-END*/;

  function applyTweaks(t) {
    var root = document.documentElement;
    root.style.setProperty('--accent', t.accent);
    root.style.setProperty('--head-font', "'" + t.headFont + "', system-ui, sans-serif");

    var hero = document.querySelector('.hero');
    if (hero) {
      hero.classList.remove('hero--centered', 'hero--left', 'hero--emblem');
      hero.classList.add('hero--' + t.heroLayout);
    }
    var banner = document.querySelector('.banner');
    if (banner) banner.classList.toggle('banner--single', t.bannerRows === 'single');
    document.body.classList.toggle('no-motion', !t.shipMotion);
    document.body.classList.toggle('no-captions', !t.shipCaptions);
  }

  function defObj(k, v) { var o = {}; o[k] = v; return o; }

  function initTweaks() {
    var state = Object.assign({}, TWEAK_DEFAULTS);
    applyTweaks(state);

    var panel = document.getElementById('tweaks');
    if (!panel) return;

    function persist(edits) {
      Object.assign(state, edits);
      applyTweaks(state);
      try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: edits }, '*'); } catch (e) {}
    }

    panel.querySelectorAll('[data-seg]').forEach(function (seg) {
      var key = seg.getAttribute('data-seg');
      seg.querySelectorAll('button').forEach(function (btn) {
        btn.addEventListener('click', function () {
          seg.querySelectorAll('button').forEach(function (b) { b.classList.remove('on'); });
          btn.classList.add('on');
          persist(defObj(key, btn.getAttribute('data-val')));
        });
      });
    });
    panel.querySelectorAll('[data-swatches]').forEach(function (sw) {
      var key = sw.getAttribute('data-swatches');
      sw.querySelectorAll('.swatch').forEach(function (s) {
        s.addEventListener('click', function () {
          sw.querySelectorAll('.swatch').forEach(function (x) { x.classList.remove('on'); });
          s.classList.add('on');
          persist(defObj(key, s.getAttribute('data-val')));
        });
      });
    });
    panel.querySelectorAll('[data-select]').forEach(function (sel) {
      var key = sel.getAttribute('data-select');
      sel.addEventListener('change', function () { persist(defObj(key, sel.value)); });
    });
    panel.querySelectorAll('[data-toggle]').forEach(function (tg) {
      var key = tg.getAttribute('data-toggle');
      tg.addEventListener('click', function () {
        var on = !tg.classList.contains('on');
        tg.classList.toggle('on', on);
        persist(defObj(key, on));
      });
    });

    syncControls(panel, state);

    var closeBtn = panel.querySelector('.twk__x');
    if (closeBtn) closeBtn.addEventListener('click', function () {
      panel.classList.remove('is-on');
      try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (e) {}
    });
    window.addEventListener('message', function (e) {
      var ty = e && e.data && e.data.type;
      if (ty === '__activate_edit_mode') panel.classList.add('is-on');
      else if (ty === '__deactivate_edit_mode') panel.classList.remove('is-on');
    });
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}
  }

  function syncControls(panel, state) {
    panel.querySelectorAll('[data-seg]').forEach(function (seg) {
      var key = seg.getAttribute('data-seg');
      seg.querySelectorAll('button').forEach(function (b) {
        b.classList.toggle('on', b.getAttribute('data-val') === String(state[key]));
      });
    });
    panel.querySelectorAll('[data-swatches]').forEach(function (sw) {
      var key = sw.getAttribute('data-swatches');
      sw.querySelectorAll('.swatch').forEach(function (s) {
        s.classList.toggle('on', s.getAttribute('data-val') === state[key]);
      });
    });
    panel.querySelectorAll('[data-select]').forEach(function (sel) {
      sel.value = state[sel.getAttribute('data-select')];
    });
    panel.querySelectorAll('[data-toggle]').forEach(function (tg) {
      tg.classList.toggle('on', !!state[tg.getAttribute('data-toggle')]);
    });
  }

  /* ---------------------------------------------------------
     boot
     --------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initBanner();
    initNav();
    initReveal();
    initModal();
    initTweaks();
  });
})();
