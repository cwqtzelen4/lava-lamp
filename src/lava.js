(function () {
  var lava = document.querySelector('.lava');
  if (!lava) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // One tall wavy column of wax (like the lamp in the logo) built from a chain of
  // overlapping circles that the goo filter fuses, plus a few loose bubbles.
  // bubble: y (share of page height), x (share of width from centre), radius px,
  //         freq, phase, travel-y px, travel-x px, spring, damping
  var bubbleSpec = [
    [0.13, -0.29, 30, 0.0052, 0.4, 150, 0.10, 0.050, 0.87],
    [0.37, 0.31, 20, 0.0071, 2.1, 170, 0.12, 0.062, 0.85],
    [0.60, -0.27, 36, 0.0046, 4.0, 160, 0.10, 0.046, 0.88],
    [0.83, 0.29, 26, 0.0062, 1.2, 150, 0.12, 0.056, 0.86]
  ];

  var goo, segs, bubs, topShine, poolShine, W, H, cx, sc, running = false;

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function div(cls, parent) {
    var el = document.createElement('span');
    el.className = cls;
    parent.appendChild(el);
    return el;
  }

  function build() {
    lava.innerHTML = '';
    W = lava.clientWidth;
    H = lava.clientHeight;
    if (!W || !H) return false;
    sc = clamp(W / 520, 0.6, 1);
    cx = W / 2;
    var s0 = window.pageYOffset || 0;

    goo = div('lava-goo', lava);

    var step = 38;
    var n = Math.ceil(H / step) + 1;
    segs = [];
    for (var i = 0; i < n; i++) {
      var el = div('lava-blob', goo);
      el.style.left = '0';
      el.style.top = '0';
      el.style.width = '100px';
      el.style.height = '100px';
      segs.push({
        el: el, y: i * step, x: cx,
        k: 0.032 + 0.03 * (0.5 + 0.5 * Math.sin(i * 0.37)), // each slice lags a bit differently: wobbly jelly
        d: 0.87, pos: s0, vel: 0
      });
    }

    bubs = bubbleSpec.map(function (s) {
      var el = div('lava-blob', goo);
      el.style.left = '0';
      el.style.top = '0';
      el.style.width = '100px';
      el.style.height = '100px';
      var d = s[2] * 2 * sc;
      var shine = div('lava-shine', lava);
      shine.style.left = '0';
      shine.style.top = '0';
      shine.style.width = (d * 0.3).toFixed(1) + 'px';
      shine.style.height = (d * 0.17).toFixed(1) + 'px';
      return { el: el, shine: shine, d: d, y: s[0], x: s[1], r: s[2] * sc, f: s[3], p: s[4], ay: s[5], ax: s[6] * W, k: s[7], dm: s[8], pos: s0, vel: 0 };
    });

    topShine = div('lava-shine', lava);
    topShine.style.left = '0';
    topShine.style.top = '0';
    topShine.style.width = (20 * sc) + 'px';
    topShine.style.height = (54 * sc) + 'px';
    poolShine = div('lava-shine', lava);
    poolShine.style.left = '0';
    poolShine.style.top = '0';
    poolShine.style.width = (58 * sc) + 'px';
    poolShine.style.height = (22 * sc) + 'px';

    segs.forEach(drawSeg);
    bubs.forEach(drawBub);
    drawShines();
    return true;
  }

  function drawSeg(g) {
    var y = g.y;
    // wax bulges slide up and down the column as you scroll
    var bulge = Math.pow(Math.max(0, Math.sin(y * 0.0058 - g.pos * 0.0042)), 2) * 44 * sc;
    var topG = Math.exp(-Math.pow((y - 70) / 55, 2));
    var botG = Math.exp(-Math.pow((y - (H - 70)) / 60, 2));
    var r = Math.max(27 * sc + bulge, 27 * sc + 40 * sc * topG, 27 * sc + 28 * sc * botG);
    var wide = 1 + 1.5 * botG;

    var sway = Math.sin(y * 0.0034 + g.pos * 0.0028) * W * 0.16 + Math.sin(y * 0.011 - g.pos * 0.004) * 12 * sc;
    var x = cx + sway * (1 - 0.85 * botG);

    var stretch = clamp(1 + Math.abs(g.vel) * 0.01, 1, 1.35);
    var sx = (2 * r * wide) / 100 / Math.sqrt(stretch);
    var sy = (2 * r) / 100 * stretch;

    g.x = x;
    g.el.style.transform = 'translate(' + (x - 50).toFixed(1) + 'px,' + (y - 50).toFixed(1) + 'px) scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')';
  }

  function drawBub(b) {
    var t = b.pos * b.f + b.p;
    var x = cx + b.x * W + Math.cos(t * 0.7) * b.ax;
    var y = b.y * H + Math.sin(t) * b.ay;

    var stretch = clamp(1 + Math.abs(b.vel) * 0.012, 1, 1.6);
    var sy = (stretch * (1 + 0.06 * Math.sin(t * 3.1 + b.p))) * b.d / 100;
    var sx = ((1 / Math.sqrt(stretch)) * (1 + 0.06 * Math.cos(t * 2.6 + b.p))) * b.d / 100;
    var rot = Math.sin(t * 0.9 + b.p) * 14;

    var rad = [];
    for (var i = 0; i < 8; i++) {
      rad.push((50 + 8 * Math.sin(t * (1.1 + i * 0.23) + b.p * (i + 1))).toFixed(1) + '%');
    }
    b.el.style.borderRadius = rad.slice(0, 4).join(' ') + ' / ' + rad.slice(4).join(' ');
    b.el.style.transform = 'translate(' + (x - 50).toFixed(1) + 'px,' + (y - 50).toFixed(1) + 'px) rotate(' + rot.toFixed(1) + 'deg) scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')';

    // highlight sits up and to the left, like the drawing
    var sw = b.d * 0.3, sh = b.d * 0.17;
    b.shine.style.transform = 'translate(' + (x - b.d * 0.2 - sw / 2).toFixed(1) + 'px,' + (y - b.d * 0.2 - sh / 2).toFixed(1) + 'px) rotate(-40deg)';
  }

  function drawShines() {
    var step = segs.length > 1 ? segs[1].y - segs[0].y : 38;
    var a = segs[Math.min(segs.length - 1, Math.round(70 / step))];
    var c = segs[Math.min(segs.length - 1, Math.round((H - 70) / step))];
    topShine.style.transform = 'translate(' + (a.x - 24 * sc - 10 * sc).toFixed(1) + 'px,' + (a.y - 14 * sc - 27 * sc).toFixed(1) + 'px) rotate(18deg)';
    poolShine.style.transform = 'translate(' + (c.x - 36 * sc - 29 * sc).toFixed(1) + 'px,' + (c.y - 10 * sc - 11 * sc).toFixed(1) + 'px) rotate(-28deg)';
  }

  function spring(o) {
    var gap = (window.pageYOffset || 0) - o.pos;
    o.vel = (o.vel + gap * o.k) * (o.dm || o.d);
    o.pos += o.vel;
    return Math.abs(o.vel) > 0.03 || Math.abs(gap) > 0.3;
  }

  function frame() {
    var active = false;
    segs.forEach(function (g) { if (spring(g)) active = true; drawSeg(g); });
    bubs.forEach(function (b) { if (spring(b)) active = true; drawBub(b); });
    drawShines();
    if (active) {
      requestAnimationFrame(frame);
    } else {
      running = false;
    }
  }

  function start() {
    if (!running && segs && segs.length) {
      running = true;
      requestAnimationFrame(frame);
    }
  }

  build();

  var timer;
  function rebuild() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      build();
    }, 150);
  }
  window.addEventListener('resize', rebuild);
  window.addEventListener('load', rebuild); // page height settles once fonts and images load

  if (reduceMotion) return;
  window.addEventListener('scroll', start, { passive: true });
})();
