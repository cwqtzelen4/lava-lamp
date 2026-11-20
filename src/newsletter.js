// Newsletter pop-up. It opens by itself the first time someone visits the site,
// and any time someone clicks "Newsletter" in the footer.
// A sign-up is sent to our Worker, which emails the address to the magazine inbox.
document.addEventListener('DOMContentLoaded', function () {
  var dialog = document.getElementById('newsletter-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  var form = dialog.querySelector('form');
  var button = form.querySelector('button');

  // show only one of the three parts: the form, the thank-you, or the error
  function show(name) {
    Array.prototype.forEach.call(dialog.querySelectorAll('.newsletter-view'), function (view) {
      view.hidden = view.getAttribute('data-view') !== name;
    });
  }

  function open() {
    show('form');
    if (!dialog.open) dialog.showModal();
  }

  Array.prototype.forEach.call(document.querySelectorAll('.newsletter-open'), function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      open();
    });
  });

  dialog.querySelector('.newsletter-close').addEventListener('click', function () {
    dialog.close();
  });
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) dialog.close();
  });
  dialog.querySelector('.newsletter-retry').addEventListener('click', function () {
    show('form');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    button.disabled = true;
    fetch(form.getAttribute('data-url'), { method: 'POST', body: new FormData(form) })
      .then(function (response) { return response.json(); })
      .then(function (answer) { show(answer.ok ? 'thanks' : 'error'); })
      .catch(function () { show('error'); })
      .then(function () { button.disabled = false; });
  });

  // first visit: open once, a moment after the page loads, then remember that we did
  var seen = false;
  try { seen = localStorage.getItem('lavalamp-newsletter-seen') === '1'; } catch (e) {}
  if (!seen) {
    setTimeout(function () {
      if (document.querySelector('dialog[open]')) return;
      try { localStorage.setItem('lavalamp-newsletter-seen', '1'); } catch (e) {}
      open();
    }, 2500);
  }
});
