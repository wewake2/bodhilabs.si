/* Hero: scattered points settle into three rows; pairs in the middle row resolve into one accent point.
   2D canvas only. Pauses off-screen and when the tab is hidden. Draws the settled state once under
   prefers-reduced-motion. */
(function () {
  var canvas = document.getElementById('hero-canvas');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var css = getComputedStyle(document.documentElement);
  var INK = css.getPropertyValue('--ink').trim() || '#362304';
  var MUTED = css.getPropertyValue('--ink-2').trim() || '#706934';
  var ACC = css.getPropertyValue('--accent').trim() || '#a93400';
  var LINE = css.getPropertyValue('--line').trim() || '#c0b490';

  var SETTLE = 2400, W = 0, H = 0, dpr = 1, pts = [], rows = [], raf = 0, running = false, t0 = 0, lastKick = 0;
  var TAU = Math.PI * 2;

  function rand(n) { return Math.random() * n; }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    if (!W || !H) return;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var cols = Math.max(9, Math.round(W / 30));
    var gx = W / (cols + 1), top = H * 0.24, gy = H * 0.26;
    pts = []; rows = [];
    for (var r = 0; r < 3; r++) {
      rows.push({ y: top + gy * r, x0: gx, x1: gx * cols });
      for (var i = 0; i < cols; i++) {
        var merge = r === 1 && i % 5 === 2;      // every fifth slot in the middle row is a resolved pair
        var n = merge ? 2 : 1;
        for (var j = 0; j < n; j++) {
          pts.push({
            sx: rand(W), sy: rand(H),
            tx: gx * (i + 1), ty: top + gy * r,
            merge: merge, phase: rand(TAU),
            delay: (i / cols) * 0.45 + r * 0.1 + rand(0.12),
            start: 0, x: 0, y: 0, p: 0
          });
        }
      }
    }
  }

  function step(now) {
    ctx.clearRect(0, 0, W, H);
    var settled = 1, k;

    // row lines, fading in with the overall progress
    for (k = 0; k < pts.length; k++) {
      var q = pts[k];
      var t = Math.min(1, Math.max(0, ((now - (q.start || t0)) / SETTLE) - (q.start ? 0 : q.delay)));
      q.p = ease(t);
      if (q.p < settled) settled = q.p;
    }
    ctx.strokeStyle = LINE; ctx.globalAlpha = 0.6 * settled; ctx.lineWidth = 1;
    for (k = 0; k < rows.length; k++) {
      ctx.beginPath(); ctx.moveTo(rows[k].x0, rows[k].y + 0.5); ctx.lineTo(rows[k].x1, rows[k].y + 0.5); ctx.stroke();
    }

    // points
    for (k = 0; k < pts.length; k++) {
      var o = pts[k], e = o.p;
      var breathe = reduce ? 0 : Math.sin(now / 1600 + o.phase) * 0.7;
      o.x = o.sx + (o.tx - o.sx) * e;
      o.y = o.sy + (o.ty - o.sy) * e + breathe * e;
      if (o.merge) {
        if (e > 0.92) {
          // resolved: one square in the accent, drawn once per pair (skip the twin)
          if (k % 2 === 0 || !pts[k - 1] || !pts[k - 1].merge) {
            ctx.globalAlpha = 1; ctx.fillStyle = ACC;
            ctx.fillRect(o.tx - 3, o.ty - 3 + breathe, 6, 6);
          }
          continue;
        }
        ctx.globalAlpha = 0.35 + 0.65 * e; ctx.fillStyle = INK;
        ctx.beginPath(); ctx.arc(o.x, o.y, 2.4, 0, TAU); ctx.fill();
      } else {
        ctx.globalAlpha = 0.25 + 0.75 * e; ctx.fillStyle = e > 0.98 ? INK : MUTED;
        ctx.beginPath(); ctx.arc(o.x, o.y, 2, 0, TAU); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // idle life: every few seconds a few points drift out and settle back
    if (!reduce && settled >= 1 && now - lastKick > 3800) {
      lastKick = now;
      for (var m = 0; m < 3; m++) {
        var pick = pts[Math.floor(rand(pts.length))];
        if (pick.merge) continue;
        pick.sx = pick.tx + (rand(80) - 40); pick.sy = pick.ty + (rand(60) - 30); pick.start = now;
      }
    }
  }

  function frame(now) {
    if (!running) return;
    step(now);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (running || reduce) return; running = true; raf = requestAnimationFrame(frame); }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

  function init() {
    layout();
    t0 = performance.now();
    lastKick = t0 + SETTLE;
    if (reduce) { t0 -= SETTLE * 4; step(performance.now()); return; }   // settled, static
    start();
  }

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { layout(); t0 = performance.now() - SETTLE * 4; step(performance.now()); }, 120);
  });
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { en[0].isIntersecting ? start() : stop(); }, { threshold: 0.05 }).observe(canvas);
  }
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(init); } else { init(); }
})();
