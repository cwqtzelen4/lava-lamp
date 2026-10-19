document.addEventListener('DOMContentLoaded', function () {
  var form = document.querySelector('.submit-form');
  var thanks = document.getElementById('submit-thanks');
  if (!form) return;

  var next = form.querySelector('input[name="_next"]');
  if (next) next.value = window.location.origin + window.location.pathname + '?sent=1';

  var errorBox = document.getElementById('submit-error');
  var errorMatch = /[?&]error=([a-z0-9]+)/.exec(window.location.search);
  if (errorBox && errorMatch) {
    var email = errorBox.getAttribute('data-email');
    var messages = {
      missing: 'Please fill in every box, choose your file and tick the ethics guide box, then send again.',
      type: 'That file type is not accepted. Please send a Word, PDF, RTF, TXT or ODT file.',
      size: 'That file is too big (15 MB is the most). Please email it to ' + email + ' instead.'
    };
    errorBox.textContent = messages[errorMatch[1]] || 'Something went wrong. Please try again, or email your piece to ' + email + '.';
    errorBox.hidden = false;
  }

  if (window.location.search.indexOf('sent=1') !== -1) {
    form.hidden = true;
    if (thanks) thanks.hidden = false;
  }
});
