/* ----- INICI SECCIÓ CÀRREGA DEL LLISTAT DE NOTÍCIES ----- */
/* Obté totes les notícies del CMS i renderitza una graella de targetes amb imatge, data i títol. */
async function loadNoticias() {
  var res = await getCMSData('/api/noticia');
  var items = res?.data || [];
  var grid = document.getElementById('news-grid');
  if (!grid) return;

  /* ----- INICI SECCIÓ RENDERITZAT DE CARDS ----- */
  items.forEach(function (item) {
    var img = item.imatge?.[0];
    var imgUrl = img ? getVoraMediaUrl(img.formats?.small?.url || img.url) : '';
    var date = item.data
      ? new Date(item.data).toLocaleDateString('ca-ES', { day: 'numeric', month: 'long', year: 'numeric' })
      : '';

    var card = document.createElement('a');
    card.href = 'noticia.html?id=' + item.id;
    card.className = 'news-card';

    card.innerHTML =
      '<div class="news-card-img">' +
        (imgUrl
          ? '<img src="' + imgUrl + '" alt="' + (item.titul || '') + '" loading="lazy" width="400" height="250">'
          : '') +
        (item.location ? '<span class="news-card-cat">' + item.location + '</span>' : '') +
      '</div>' +
      '<div class="news-card-body">' +
        '<span class="news-card-date">' + date + '</span>' +
        '<h3 class="news-card-title">' + (item.titul || '') + '</h3>' +
      '</div>';

    grid.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', loadNoticias);
