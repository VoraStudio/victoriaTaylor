/* ----- INICI SECCIÓ CÀRREGA AGENDA ----- */
/* Punt d'entrada: obté tots els events del CMS, els classifica per data i renderitza les pestanyes. */
async function loadAgenda() {
  var res = await getCMSData('/api/event');
  if (!res) return;

  var items = res?.data || [];
  if (!items.length) return;

  /* Classifiquem events: futurs (avui o després) vs històrics (abans d'avui) */
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var upcoming = items.filter(function(e) { return new Date(e.data) >= today; });
  var historical = items.filter(function(e) { return new Date(e.data) < today; });

  var list = document.getElementById('agenda-list');
  if (!list) return;

  /* Mostrem el comptador a cada pestanya */
  var countUp = document.getElementById('agenda-count-upcoming');
  var countHist = document.getElementById('agenda-count-historical');
  if (countUp) countUp.textContent = '(' + upcoming.length + ')';
  if (countHist) countHist.textContent = '(' + historical.length + ')';

  list.innerHTML = renderCards(upcoming, 'upcoming') + renderCards(historical, 'historical');

  /* ----- INICI SECCIÓ PESTANTES (tabs) ----- */
  /* Canvia entre events pròxims i històrics. Actualitza aria-selected per accessibilitat. */
  var tabUp = document.getElementById('agenda-tab-upcoming');
  var tabHist = document.getElementById('agenda-tab-historical');

  function switchTab(tab) {
    var isUp = tab === tabUp;
    tabUp.classList.toggle('is-active', isUp);
    tabUp.setAttribute('aria-selected', isUp);
    tabHist.classList.toggle('is-active', !isUp);
    tabHist.setAttribute('aria-selected', !isUp);
    var upcomingEl = document.getElementById('agenda-upcoming');
    var historicalEl = document.getElementById('agenda-historical');
    if (upcomingEl) upcomingEl.style.display = isUp ? '' : 'none';
    if (historicalEl) historicalEl.style.display = isUp ? 'none' : '';
  }

  if (tabUp) {
    tabUp.addEventListener('click', function() { switchTab(tabUp); });
    switchTab(tabUp);
  }
  if (tabHist) {
    tabHist.addEventListener('click', function() { switchTab(tabHist); });
  }

  /* ----- INICI SECCIÓ ANIMACIONS GSAP ----- */
  var heroTitle = document.querySelector('.agenda-hero-title');
  if (heroTitle && typeof gsap !== 'undefined') {
    heroTitle.style.visibility = 'visible';
    gsap.from(heroTitle, {
      y: 60,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
      delay: 0.3
    });
  }

  /* Animació d'entrada de les cards en fer scroll */
  var cards = document.querySelectorAll('.agenda-card');
  if (cards.length && typeof gsap !== 'undefined') {
    cards.forEach(function(c) { c.style.visibility = 'visible'; });
    gsap.from(cards, {
      y: 60,
      opacity: 0,
      duration: 0.9,
      stagger: { each: 0.12, from: 'start' },
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.agenda-list-wrap',
        start: 'top 85%',
        once: true
      }
    });
  }
}

/* ----- INICI SECCIÓ RENDERITZAT DE CARDS ----- */
/* Converteix un array d'events en HTML de targetes. type = 'upcoming' | 'historical' */
function renderCards(arr, type) {
  if (!arr.length) return '<p class="agenda-empty">No hi ha events</p>';

  var container = '<div id="agenda-' + type + '" class="agenda-' + type + '">';
  container += arr.map(function(e) {
    var img = e.imatge?.[0];
    var imgUrl = img ? getVoraMediaUrl(img.formats?.small?.url || img.url) : '';
    var date = e.data
      ? new Date(e.data).toLocaleDateString('ca-ES', { day: 'numeric', month: 'long', year: 'numeric' })
      : '';
    var desc = e.descripcio ? e.descripcio.replace(/<[^>]+>/g, '').substring(0, 120) + '...' : '';

    return (
      '<a href="evento.html?id=' + e.id + '" class="agenda-card">' +
        (imgUrl ? '<div class="agenda-card-img"><img src="' + imgUrl + '" alt="' + (e.titul || '') + '" loading="lazy" width="300" height="200"></div>' : '') +
        '<div class="agenda-card-body">' +
          '<h3 class="agenda-card-title">' + (e.titul || '') + '</h3>' +
          '<div class="agenda-card-meta">' +
            (date ? '<span class="agenda-card-date">' + date + '</span>' : '') +
            (e.hora ? '<span class="agenda-card-time">' + e.hora + '</span>' : '') +
            (e.location ? '<span class="agenda-card-location">' + e.location + '</span>' : '') +
          '</div>' +
          (desc ? '<p class="agenda-card-desc">' + desc + '</p>' : '') +
        '</div>' +
      '</a>'
    );
  }).join('');
  container += '</div>';
  return container;
}

document.addEventListener('DOMContentLoaded', loadAgenda);
