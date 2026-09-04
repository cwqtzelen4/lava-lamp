document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('story-search');
  var empty = document.getElementById('search-empty');
  if (!input) return;

  var cards = Array.prototype.slice.call(document.querySelectorAll('.story-card'));

  input.addEventListener('input', function () {
    var query = input.value.trim().toLowerCase();
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      var matches = haystack.indexOf(query) !== -1;
      card.hidden = !matches;
      if (matches) visibleCount++;
    });

    if (empty) empty.hidden = visibleCount !== 0;
  });
});
