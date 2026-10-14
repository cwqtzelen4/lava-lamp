// Footer "Contact" link: opens a small pop-up with two buttons (Gmail, Outlook)
// that start a new email to the magazine. Without JavaScript the link is
// still a normal mailto: link.
document.addEventListener('DOMContentLoaded', function () {
  var dialog = document.getElementById('contact-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  Array.prototype.forEach.call(document.querySelectorAll('.contact-open'), function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
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
});
