// A new number on every build. Added to the stylesheet and script links so visitors'
// browsers never keep showing an old version of the design after the site is updated.
// year: the current year, for the copyright line in the footer (updates by itself every January)
module.exports = { time: Date.now(), year: new Date().getFullYear() };
