(function () {
  var d = document, L = d.documentElement.lang;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  function track(cta) {
    if (window.dataLayer) window.dataLayer.push({ event: 'whatsapp_click', cta: cta, lang: L });
  }
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="https://wa.me/"]');
    if (a) track(a.getAttribute('data-cta') || 'link');
  });

  // Language menu: close on outside click or Escape; remember explicit choice
  d.addEventListener('click', function (e) {
    d.querySelectorAll('details.lang[open]').forEach(function (x) { if (!x.contains(e.target)) x.open = false; });
  });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') d.querySelectorAll('details.lang[open]').forEach(function (x) { x.open = false; });
  });
  d.querySelectorAll('[data-setlang]').forEach(function (a) {
    a.addEventListener('click', function () { store.set('lang', a.getAttribute('data-setlang')); });
  });

  // Suggest the visitor's browser language once — never auto-redirect (keeps SEO clean)
  var hint = d.getElementById('langhint');
  if (hint && !store.get('lang')) {
    var prefs = (navigator.languages || [navigator.language || '']).map(function (x) { return String(x).slice(0, 2).toLowerCase(); });
    for (var i = 0; i < prefs.length; i++) {
      if (prefs[i] === L) break;
      var link = hint.querySelector('[data-hint="' + prefs[i] + '"]');
      if (link) { link.hidden = false; hint.hidden = false; break; }
    }
    hint.querySelector('button').addEventListener('click', function () { hint.hidden = true; store.set('lang', L); });
  }

  // Quick quote: compose a WhatsApp message from the form (no backend, no booking)
  var form = d.getElementById('quote-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = JSON.parse(form.getAttribute('data-msg')), lines = [m.intro];
      ['from', 'to', 'date', 'time', 'pax', 'flight', 'notes'].forEach(function (k) {
        var v = (form.elements[k].value || '').trim();
        if (!v) return;
        if (k === 'date') {
          var dt = new Date(v + 'T12:00:00');
          if (!isNaN(dt)) v = dt.toLocaleDateString(L, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        }
        lines.push('• ' + m.fields[k] + ': ' + v);
      });
      lines.push('', m.outro);
      var url = form.getAttribute('data-wa') + '?text=' + encodeURIComponent(lines.join('\n'));
      track('quote-form');
      var w = window.open(url, '_blank');
      if (w) w.opener = null; else location.href = url;
    });
  }

  // Desktop: floating WhatsApp button appears once the hero CTA scrolls away
  var heroCta = d.getElementById('hero-cta'), dock = d.getElementById('dock');
  if (dock) {
    if (heroCta && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { dock.classList.toggle('show', !en[0].isIntersecting); }).observe(heroCta);
    } else dock.classList.add('show');
  }

  // Live Google Reviews widget: inject only when the section is near the viewport
  var tpl = d.getElementById('reviews-embed'), slot = d.getElementById('reviews-slot');
  if (tpl && slot) {
    var loaded = false;
    var load = function () {
      if (loaded) return;
      loaded = true;
      var frag = tpl.content.cloneNode(true);
      frag.querySelectorAll('script').forEach(function (s) {
        var n = d.createElement('script');
        for (var j = 0; j < s.attributes.length; j++) n.setAttribute(s.attributes[j].name, s.attributes[j].value);
        n.text = s.text;
        s.parentNode.replaceChild(n, s);
      });
      slot.innerHTML = '';
      slot.classList.remove('is-loading');
      slot.appendChild(frag);
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); load(); } }, { rootMargin: '800px' });
      io.observe(slot);
    } else load();
  }
})();
