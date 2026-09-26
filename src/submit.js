document.addEventListener('DOMContentLoaded', function () {
  var form = document.querySelector('.submit-form');
  var thanks = document.getElementById('submit-thanks');
  if (!form) return;

  var next = form.querySelector('input[name="_next"]');
  if (next) next.value = window.location.origin + window.location.pathname + '?sent=1';

  if (window.location.search.indexOf('sent=1') !== -1) {
    form.hidden = true;
    if (thanks) thanks.hidden = false;
  }
});
