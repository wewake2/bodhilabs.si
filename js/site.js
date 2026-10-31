/* Section reveals and CTA events. Everything here is progressive: the page is complete without it. */
(function () {
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    els.forEach(function (el) { io.observe(el); });
    // Safety: nothing stays hidden for a reader who never scrolls, a crawler, or print.
    setTimeout(function () { els.forEach(function (el) { el.classList.add('in'); }); }, 2000);
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  // Plausible custom events on the calls to action: name from data-event, placement from data-where.
  function track(name, where) {
    if (typeof window.plausible === 'function') window.plausible(name, { props: { where: where || '' } });
  }
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('[data-event]');
    if (a) track(a.getAttribute('data-event'), a.getAttribute('data-where'));
  });

  // Calendly: loaded only when the contact section comes into view. The button stays as the
  // fallback until the widget's iframe is actually on the page; if the script never arrives,
  // the button is all a visitor sees, which still works.
  var cal = document.getElementById('calendly');
  if (cal) {
    var loadCalendly = function () {
      if (cal.getAttribute('data-loaded')) return;
      cal.setAttribute('data-loaded', '1');
      var box = document.createElement('div');
      box.className = 'calendly-inline-widget';
      box.setAttribute('data-url', cal.getAttribute('data-url'));
      cal.insertBefore(box, cal.firstChild);
      var s = document.createElement('script');
      s.src = 'https://assets.calendly.com/assets/external/widget.js';
      s.async = true;
      s.onerror = function () { cal.removeChild(box); cal.removeAttribute('data-loaded'); };
      document.head.appendChild(s);
      // hide the fallback once the iframe exists; give up quietly after 6 s
      var tries = 0, poll = setInterval(function () {
        if (box.querySelector('iframe')) { cal.classList.add('is-live'); clearInterval(poll); }
        else if (++tries > 30) clearInterval(poll);
      }, 200);
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en, obs) {
        if (en[0].isIntersecting) { loadCalendly(); obs.disconnect(); }
      }, { rootMargin: '400px 0px' }).observe(cal);
    } else {
      loadCalendly();
    }
    window.addEventListener('message', function (e) {
      if (e.origin === 'https://calendly.com' && e.data && e.data.event === 'calendly.event_scheduled') track('Booked', 'calendly');
    });
  }
})();
