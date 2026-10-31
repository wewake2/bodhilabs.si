/* Hero: points fly in from outside the frame and settle into three rows; pairs in the middle row
   resolve into one accent square. In idle, pairs periodically split and re-resolve, and points drift
   out and return. 2D canvas only. Pauses off-screen and when the tab is hidden. Draws the settled
   state once under prefers-reduced-motion. */
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

  var SETTLE = 2600, W = 0, H = 0, dpr = 1, R = 3, pts = [], rows = [], pairs = [];
  var raf = 0, running = false, t0 = 0, lastKick = 0, lastSplit = 0, arrived = false;
  var TAU = Math.PI * 2;

  function rand(n) { return Math.random() * n; }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function outside() {
    // a start point beyond the canvas edge, so the points visibly arrive
    var side = Math.floor(rand(4)), m = 60;
    if (side === 0) return [rand(W), -m];
    if (side === 1) return [W + m, rand(H)];
    if (side === 2) return [rand(W), H + m];
    return [-m, rand(H)];
  }

  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    if (!W || !H) return;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    R = W < 480 ? 2.8 : 3.8;
    arrived = false;
    var cols = Math.max(8, Math.round(W / 36));
    var gx = W / (cols + 1), top = H * 0.2, gy = H * 0.3;
    pts = []; rows = []; pairs = [];
    for (var r = 0; r < 3; r++) {
      rows.push({ y: top + gy * r, x0: gx, x1: gx * cols });
      for (var i = 0; i < cols; i++) {
        var merge = r === 1 && i % 4 === 1;      // every fourth slot in the middle row is a resolved pair
        var n = merge ? 2 : 1, twins = [];
        for (var j = 0; j < n; j++) {
          var s = outside();
          var p = {
            sx: s[0], sy: s[1],
            tx: gx * (i + 1), ty: top + gy * r,
            merge: merge, phase: rand(TAU),
            delay: (i / cols) * 0.5 + r * 0.12 + rand(0.1),
            start: 0, x: 0, y: 0, p: 0, resolvedAt: 0
          };
          pts.push(p); twins.push(p);
        }
        if (merge) pairs.push(twins);
      }
    }
  }

  function progress(q, now) {
    var t = (now - (q.start || t0)) / SETTLE - (q.start ? 0 : q.delay);
    return ease(Math.min(1, Math.max(0, t)));
  }

  function step(now) {
    ctx.clearRect(0, 0, W, H);
    var settled = 1, k, q;

    for (k = 0; k < pts.length; k++) {
      q = pts[k]; q.p = progress(q, now);
      if (q.p < settled) settled = q.p;
      var breathe = reduce ? 0 : Math.sin(now / 1400 + q.phase) * 2.2;
      q.x = q.sx + (q.tx - q.sx) * q.p;
      q.y = q.sy + (q.ty - q.sy) * q.p + breathe * q.p;
    }
    if (settled >= 1) arrived = true;
    var lineA = arrived ? 1 : settled;

    // row lines, with a read-head travelling along each once the rows have formed
    ctx.strokeStyle = LINE; ctx.globalAlpha = 0.9 * lineA; ctx.lineWidth = 1.5;
    for (k = 0; k < rows.length; k++) {
      ctx.beginPath(); ctx.moveTo(rows[k].x0, rows[k].y + 0.5); ctx.lineTo(rows[k].x1, rows[k].y + 0.5); ctx.stroke();
    }
    if (arrived && !reduce) {
      for (k = 0; k < rows.length; k++) {
        var span = rows[k].x1 - rows[k].x0, u = ((now / 5200) + k * 0.33) % 1, hx = rows[k].x0 + span * u;
        var grad = ctx.createLinearGradient(hx - 70, 0, hx, 0);
        grad.addColorStop(0, 'rgba(169,52,0,0)'); grad.addColorStop(1, 'rgba(169,52,0,0.55)');
        ctx.strokeStyle = grad; ctx.globalAlpha = 1; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(Math.max(rows[k].x0, hx - 70), rows[k].y + 0.5); ctx.lineTo(hx, rows[k].y + 0.5); ctx.stroke();
        ctx.fillStyle = ACC; ctx.globalAlpha = 0.9;
        ctx.beginPath(); ctx.arc(hx, rows[k].y + 0.5, 2.2, 0, TAU); ctx.fill();
      }
    }

    // single points
    for (k = 0; k < pts.length; k++) {
      q = pts[k]; if (q.merge) continue;
      ctx.globalAlpha = 0.3 + 0.7 * q.p; ctx.fillStyle = q.p > 0.98 ? INK : MUTED;
      ctx.beginPath(); ctx.arc(q.x, q.y, R, 0, TAU); ctx.fill();
    }

    // pairs: two points converge, then one accent square with a short ring on arrival
    for (k = 0; k < pairs.length; k++) {
      var a = pairs[k][0], b = pairs[k][1], e = Math.min(a.p, b.p);
      if (e > 0.96) {
        if (!a.resolvedAt) a.resolvedAt = now;
        var age = now - a.resolvedAt, s = R * 2.6, by = (a.y - a.ty);
        ctx.globalAlpha = 1; ctx.fillStyle = ACC;
        ctx.fillRect(a.tx - s / 2, a.ty - s / 2 + by, s, s);
        if (age < 700) {
          ctx.globalAlpha = 0.6 * (1 - age / 700); ctx.strokeStyle = ACC; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(a.tx, a.ty + by, s * 0.8 + age / 28, 0, TAU); ctx.stroke();
        }
      } else {
        a.resolvedAt = 0;
        ctx.fillStyle = ACC;
        ctx.globalAlpha = 0.5 + 0.5 * a.p; ctx.beginPath(); ctx.arc(a.x, a.y, R, 0, TAU); ctx.fill();
        ctx.globalAlpha = 0.5 + 0.5 * b.p; ctx.beginPath(); ctx.arc(b.x, b.y, R, 0, TAU); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    if (reduce || !arrived) return;
    // idle: points drift out and return
    if (now - lastKick > 1500) {
      lastKick = now;
      for (var m = 0; m < 4; m++) {
        var pick = pts[Math.floor(rand(pts.length))];
        if (pick.merge) continue;
        pick.sx = pick.tx + (rand(240) - 120); pick.sy = pick.ty + (rand(160) - 80); pick.start = now;
      }
    }
    // idle: a resolved pair splits apart and comes back together
    if (now - lastSplit > 2800) {
      lastSplit = now;
      var pr = pairs[Math.floor(rand(pairs.length))];
      var dx = 50 + rand(70), dy = rand(60) - 30;
      pr[0].sx = pr[0].tx - dx; pr[0].sy = pr[0].ty + dy; pr[0].start = now;
      pr[1].sx = pr[1].tx + dx; pr[1].sy = pr[1].ty - dy; pr[1].start = now;
    }
  }

  function frame(now) { if (!running) return; step(now); raf = requestAnimationFrame(frame); }
  function start() { if (running || reduce) return; running = true; raf = requestAnimationFrame(frame); }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

  function init() {
    layout();
    t0 = performance.now();
    lastKick = lastSplit = t0 + SETTLE;
    if (reduce) { t0 -= SETTLE * 4; step(performance.now()); return; }
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
