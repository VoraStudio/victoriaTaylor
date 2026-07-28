/* ----- INICI SECCIÓ CÀRREGA DE NOTÍCIA INDIVIDUAL ----- */
/* Llegeix ?id= de la URL, obté la notícia del CMS i omple hero + metadades + cos. */
async function loadNoticia() {
  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');
  if (!id) return;

  var res = await getCMSData('/api/public/victoria-taylor/noticia/' + id);
  var item = res?.data;
  if (!item) return;

  /* ----- INICI SECCIÓ HERO (fons + títol + data + ubicació) ----- */
  var img = item.imatge?.[0];
  var imgUrl = img ? getVoraMediaUrl(img.url) : '';
  var date = item.data
    ? new Date(item.data).toLocaleDateString('ca-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  var heroBg = document.getElementById('noticia-hero-bg');
  if (heroBg && imgUrl) heroBg.style.backgroundImage = 'url(' + imgUrl + ')';

  var titleEl = document.getElementById('noticia-title');
  if (titleEl) { titleEl.textContent = item.titul; titleEl.style.visibility = 'visible'; }

  var dateEl = document.getElementById('noticia-date');
  if (dateEl) dateEl.textContent = date;

  var locEl = document.getElementById('noticia-location');
  if (locEl) locEl.textContent = item.location || '';

  /* ----- INICI SECCIÓ COS (contingut HTML) ----- */
  var bodyEl = document.getElementById('noticia-body');
  if (bodyEl) bodyEl.innerHTML = item.descripcio || '';
}

document.addEventListener('DOMContentLoaded', loadNoticia);
