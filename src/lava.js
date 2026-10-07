(function () {
  var lava = document.querySelector('.lava');
  if (!lava) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // x%, y% (position in the zone), size px, freq, phase, travel-y px, travel-x px, pink, spring, damping
  var spec = [
    [20, 3, 100, 0.0046, 0.0, 120, 18, 0, 0.050, 0.87],
    [66, 6, 64, 0.0071, 1.3, 90, 20, 1, 0.060, 0.85],
    [40, 11, 128, 0.0040, 2.1, 140, 14, 0, 0.040, 0.89],
    [80, 16, 84, 0.0062, 4.0, 110, 16, 0, 0.055, 0.86],
    [24, 22, 70, 0.0079, 5.2, 100, 22, 1, 0.065, 0.84],
    [58, 27, 116, 0.0047, 0.7, 140, 16, 0, 0.045, 0.88],
    [84, 32, 60, 0.0090, 3.3, 90, 12, 1, 0.070, 0.84],
    [36, 38, 92, 0.0057, 2.9, 120, 18, 0, 0.050, 0.87],
    [70, 43, 52, 0.0098, 1.9, 80, 10, 1, 0.060, 0.85],
    [18, 48, 122, 0.0044, 3.8, 140, 14, 0, 0.042, 0.89],
    [62, 53, 88, 0.0066, 0.4, 110, 20, 0, 0.055, 0.86],
    [86, 58, 66, 0.0083, 5.6, 90, 12, 1, 0.065, 0.84],
    [42, 63, 104, 0.0051, 2.5, 130, 18, 0, 0.048, 0.88],
    [22, 69, 62, 0.0092, 4.4, 90, 22, 1, 0.068, 0.84],
    [74, 73, 112, 0.0045, 1.1, 130, 14, 0, 0.043, 0.89],
    [50, 78, 72, 0.0075, 3.0, 100, 18, 1, 0.060, 0.85],
    [16, 83, 94, 0.0059, 5.0, 120, 16, 0, 0.052, 0.87],
    [82, 87, 78, 0.0069, 0.2, 100, 14, 0, 0.056, 0.86],
    [44, 92, 118, 0.0042, 2.2, 130, 16, 0, 0.045, 0.88],
    [68, 96, 58, 0.0095, 4.7, 70, 12, 1, 0.066, 0.84],
    [28, 97, 80, 0.0064, 1.6, 70, 18, 0, 0.054, 0.86]
  ];

  var blobs = spec.map(function (s) {
    var el = document.createElement('span');
    el.className = 'lava-blob' + (s[7] ? ' pink' : '');
    el.style.left = s[0] + '%';
    el.style.top = s[1] + '%';
    el.style.width = s[2] + 'px';
    el.style.height = s[2] + 'px';
    lava.appendChild(el);
    return { el: el, f: s[3], p: s[4], ay: s[5], ax: s[6], k: s[8], d: s[9], pos: 0, vel: 0 };
  });

  var running = false;

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function draw(b, t) {
    var x = Math.cos(t * 0.7) * b.ax;
    var y = Math.sin(t) * b.ay;

    // squash and stretch: elongate along the scroll direction, keep volume
    var speed = Math.abs(b.vel);
    var stretch = clamp(1 + speed * 0.014, 1, 1.75);
    var sy = stretch * (1 + 0.07 * Math.sin(t * 3.1 + b.p));
    var sx = (1 / Math.sqrt(stretch)) * (1 + 0.07 * Math.cos(t * 2.6 + b.p * 1.3));
    var rot = Math.sin(t * 0.9 + b.p) * 16 + clamp(b.vel * 0.5, -12, 12);

    // wobbling outline so each one reads as a soft blob, not a circle
    var r = [];
    for (var i = 0; i < 8; i++) {
      r.push((50 + 15 * Math.sin(t * (1.1 + i * 0.23) + b.p * (i + 1))).toFixed(1) + '%');
    }
    var radius = r.slice(0, 4).join(' ') + ' / ' + r.slice(4).join(' ');

    b.el.style.borderRadius = radius;
    b.el.style.transform =
      'translate(-50%, -50%) translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px) ' +
      'rotate(' + rot.toFixed(1) + 'deg) scale(' + sx.toFixed(3) + ', ' + sy.toFixed(3) + ')';
  }

  function frame() {
    var s = window.pageYOffset || 0;
    var active = false;
    blobs.forEach(function (b) {
      var gap = s - b.pos;
      b.vel = (b.vel + gap * b.k) * b.d;   // springy follow: overshoots and jiggles like jelly
      b.pos += b.vel;
      if (Math.abs(b.vel) > 0.03 || Math.abs(gap) > 0.3) active = true;
      draw(b, b.pos * b.f + b.p);
    });
    if (active) {
      requestAnimationFrame(frame);
    } else {
      running = false;
    }
  }

  function start() {
    if (!running) {
      running = true;
      requestAnimationFrame(frame);
    }
  }

  var s0 = window.pageYOffset || 0;
  blobs.forEach(function (b) {
    b.pos = s0;
    draw(b, b.pos * b.f + b.p);
  });

  if (reduceMotion) return;
  window.addEventListener('scroll', start, { passive: true });
})();
