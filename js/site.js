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
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('[data-event]');
    if (!a || typeof window.plausible !== 'function') return;
    window.plausible(a.getAttribute('data-event'), { props: { where: a.getAttribute('data-where') || '' } });
  });
})();
