(function () {
  var lava = document.querySelector('.lava');
  if (!lava) return;

  var blobs = Array.prototype.slice.call(lava.querySelectorAll('.lava-blob'));
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var height = 0;
  var ticking = false;

  function measure() {
    height = lava.clientHeight;
  }

  function render() {
    ticking = false;
    var s = window.pageYOffset || 0;
    blobs.forEach(function (b) {
      var f = parseFloat(b.getAttribute('data-f'));
      var p = parseFloat(b.getAttribute('data-p'));
      var ay = (parseFloat(b.getAttribute('data-ay')) / 100) * height;
      var ax = parseFloat(b.getAttribute('data-ax'));
      var y = Math.sin(s * f + p) * ay;
      var x = Math.cos(s * f * 0.7 + p) * ax;
      b.style.transform = 'translate(-50%, -50%) translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px)';
    });
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  measure();
  render();
  if (reduceMotion) return;

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    measure();
    onScroll();
  });
})();
