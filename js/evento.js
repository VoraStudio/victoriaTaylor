/* ----- INICI SECCIÓ CÀRREGA D'EVENT INDIVIDUAL ----- */
/* Llegeix ?id= de la URL, obté l'event del CMS i omple tota la pàgina (hero, metadades, cos i CTA). */
async function loadEvento() {
  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');
  if (!id) return;

  var res = await getCMSData('/api/event/' + id);
  var item = res?.data;
  if (!item) return;

  /* ----- INICI SECCIÓ HERO (fons + títol + metadades) ----- */
  var img = item.imatge?.[0];
  var imgUrl = img ? getVoraMediaUrl(img.url) : '';
  var date = item.data
    ? new Date(item.data).toLocaleDateString('ca-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  var heroBg = document.getElementById('evento-hero-bg');
  if (heroBg && imgUrl) heroBg.style.backgroundImage = 'url(' + imgUrl + ')';

  var titleEl = document.getElementById('evento-title');
  if (titleEl) { titleEl.textContent = item.titul; titleEl.style.visibility = 'visible'; }

  var dateEl = document.getElementById('evento-date');
  if (dateEl) dateEl.textContent = date;

  var timeEl = document.getElementById('evento-time');
  if (timeEl) timeEl.textContent = item.hora || '';

  var locEl = document.getElementById('evento-location');
  if (locEl) locEl.textContent = item.location || '';

  /* ----- INICI SECCIÓ COS (descripció + CTA) ----- */
  var bodyEl = document.getElementById('evento-body');
  if (bodyEl) bodyEl.innerHTML = item.descripcio || '';

  var ctaWrap = document.getElementById('evento-cta-wrap');
  var ctaLink = document.getElementById('evento-cta-link');
  if (item.cta_url && ctaWrap && ctaLink) {
    ctaLink.href = item.cta_url;
    ctaLink.textContent = item.cta_text || 'Més informació';
  } else if (ctaWrap) {
    ctaWrap.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', loadEvento);
