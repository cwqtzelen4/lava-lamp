(function () {
  var lava = document.querySelector('.lava');
  if (!lava) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var colors = ['#ff86bc', '#ff9fcb', '#ffb9d9', '#ff68a9'];

  // x% and y% of the zone, size px, freq, phase, travel-y px, travel-x px, colour
  var spec = [
    [30, 3, 110, 0.0034, 0.0, 150, 36, 0],
    [70, 9, 70, 0.0050, 1.3, 130, 42, 2],
    [42, 16, 140, 0.0030, 2.1, 190, 30, 1],
    [76, 24, 84, 0.0046, 4.0, 150, 38, 0],
    [26, 31, 96, 0.0040, 5.2, 140, 44, 3],
    [60, 39, 130, 0.0032, 0.7, 200, 34, 0],
    [80, 47, 64, 0.0054, 3.3, 120, 30, 2],
    [36, 54, 120, 0.0036, 2.9, 170, 40, 1],
    [68, 62, 90, 0.0044, 1.9, 150, 36, 0],
    [28, 70, 74, 0.0052, 4.4, 130, 44, 3],
    [58, 77, 136, 0.0031, 1.1, 190, 32, 0],
    [78, 85, 72, 0.0048, 5.6, 140, 34, 2],
    [40, 92, 112, 0.0038, 2.5, 160, 38, 1],
    [66, 97, 80, 0.0045, 0.4, 100, 30, 0]
  ];

  var goo, blobs = [], pos = 0, running = false, H = 0, W = 0;

  function build() {
    lava.innerHTML = '';
    W = lava.clientWidth;
    H = lava.clientHeight;
    goo = document.createElement('span');
    goo.className = 'lava-goo';
    lava.appendChild(goo);
    var k = Math.max(0.6, Math.min(1, W / 520));
    blobs = spec.map(function (s) {
      var d = s[2] * k * 1.18;
      var el = document.createElement('span');
      el.className = 'lava-blob';
      el.style.left = '0';
      el.style.top = '0';
      el.style.width = d + 'px';
      el.style.height = d + 'px';
      el.style.background = colors[s[7]];
      goo.appendChild(el);
      return { el: el, x: s[0] / 100 * W, y: s[1] / 100 * H, d: d, f: s[3], p: s[4], ay: s[5] * k * 1.25, ax: s[6] * k * 1.2 };
    });
    pos = window.pageYOffset || 0;
    draw();
  }

  function draw() {
    blobs.forEach(function (b) {
      var t = pos * b.f + b.p;
      var x = b.x + Math.cos(t * 0.7) * b.ax;
      var y = b.y + Math.sin(t) * b.ay;
      var s = (1 + 0.06 * Math.sin(t * 1.3 + b.p));  // slow, gentle breathing
      b.el.style.transform = 'translate(' + (x - b.d / 2).toFixed(1) + 'px,' + (y - b.d / 2).toFixed(1) + 'px) scale(' + s.toFixed(3) + ')';
    });
  }

  function frame() {
    var target = window.pageYOffset || 0;
    pos += (target - pos) * 0.07;   // smooth glide behind the scroll, no overshoot
    if (Math.abs(target - pos) < 0.2) pos = target;
    draw();
    if (pos !== target) {
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

  build();

  var timer;
  function rebuild() {
    clearTimeout(timer);
    timer = setTimeout(build, 150);
  }
  window.addEventListener('resize', rebuild);
  window.addEventListener('load', rebuild); // page height settles once fonts and images load

  if (reduceMotion) return;
  window.addEventListener('scroll', start, { passive: true });
})();
