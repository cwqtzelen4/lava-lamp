// Footer "Contact" link: opens a small pop-up with a message form instead of
// relying on the visitor's mail app. Without JavaScript the link is still a
// normal mailto: link.
document.addEventListener('DOMContentLoaded', function () {
  var dialog = document.getElementById('contact-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  var form = document.getElementById('contact-form');
  var status = dialog.querySelector('.contact-status');
  var button = form.querySelector('button[type="submit"]');
  var fallback = document.querySelector('.contact-open').getAttribute('href');

  function say(text, isError) {
    status.hidden = false;
    status.className = 'contact-status' + (isError ? ' is-error' : '');
    status.textContent = text;
    if (isError) {
      status.appendChild(document.createTextNode(' You can also email us directly at '));
      var a = document.createElement('a');
      a.href = fallback;
      a.textContent = fallback.replace('mailto:', '');
      status.appendChild(a);
      status.appendChild(document.createTextNode('.'));
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll('.contact-open'), function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      status.hidden = true;
      dialog.showModal();
    });
  });

  dialog.querySelector('.contact-close').addEventListener('click', function () {
    dialog.close();
  });

  // clicking the dim area outside the box closes it
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) dialog.close();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    button.disabled = true;
    status.hidden = true;
    fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (String(data.success) === 'true') {
          form.reset();
          say('Thank you! Your message is on its way.', false);
        } else {
          say('Sorry, that did not go through.', true);
        }
      })
      .catch(function () {
        say('Sorry, that did not go through.', true);
      })
      .then(function () {
        button.disabled = false;
      });
  });
});
