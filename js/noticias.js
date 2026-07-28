/* ----- INICI SECCIÓ CÀRREGA DEL LLISTAT DE NOTÍCIES ----- */
/* Obté totes les notícies del CMS i renderitza una graella de targetes amb imatge, data i títol. */
async function loadNoticias() {
  var res = await getCMSData('/api/public/victoria-taylor/noticia');
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

    // Extreure extracte net del text de la descripció (richtext HTML)
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = item.descripcio || '';
    var textContent = tempDiv.textContent || tempDiv.innerText || '';
    var excerpt = textContent.trim();
    if (excerpt.length > 95) {
      excerpt = excerpt.substring(0, 95) + '...';
    }

    var card = document.createElement('a');
    card.href = '#';
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
        (excerpt ? '<p class="news-card-excerpt">' + excerpt + '</p>' : '') +
      '</div>';

    card.addEventListener('click', function (e) {
      e.preventDefault();
      openNewsModal(item);
    });

    grid.appendChild(card);
  });
}

/* ----- INICI SECCIÓ MODAL PREVISUALITZACIÓ NOTÍCIA ----- */
function openNewsModal(item) {
  var existing = document.querySelector('.news-modal');
  if (existing) existing.remove();

  var img = item.imatge?.[0];
  var imgUrl = img ? getVoraMediaUrl(img.url) : '';
  
  // Resoldre data (data / date)
  var dateVal = item.data || item.date || '';
  var date = dateVal
    ? new Date(dateVal).toLocaleDateString('ca-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  // Resoldre ubicació (location / ubicacio)
  var location = item.location || item.ubicacio || '';

  // Resoldre rang de dates (date_range)
  var rangeHTML = '';
  if (item.rang_de_dates) {
    try {
      var range = typeof item.rang_de_dates === 'string' ? JSON.parse(item.rang_de_dates) : item.rang_de_dates;
      if (range && range.start) {
        var start = new Date(range.start).toLocaleDateString('ca-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        var end = new Date(range.end).toLocaleDateString('ca-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        rangeHTML = '<div class="m9-range"><span>Rang de dates:</span> ' + start + ' &middot; ' + end + '</div>';
      }
    } catch(e) {}
  }

  // Resoldre galeria o imatges (gallery) - Bento Grid de 4 slots de l'Exemple 9
  var galeria = item.galeria || item.imatges || [];
  var galleryItemsHTML = '';
  for (var i = 0; i < 4; i++) {
    if (galeria[i]) {
      var itemUrl = getVoraMediaUrl(galeria[i].url);
      galleryItemsHTML += '<div style="background-image: url(\'' + itemUrl + '\');"></div>';
    } else {
      galleryItemsHTML += '<div style="border: 1px dashed var(--modal-border); background-color: var(--modal-gallery-bg);"></div>';
    }
  }

  // Estil de cabecera per Ejemplo 9: Hero con imatge o color degradat vermell
  var heroStyle = imgUrl 
    ? 'background-image: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(\'' + imgUrl + '\'); background-size: cover; background-position: center;'
    : 'background: linear-gradient(135deg, #e24b4a 0%, #6b1a1a 100%);';

  var modalHTML = 
    '<div class="news-modal" aria-hidden="true" role="dialog">' +
      '<div class="news-modal-overlay"></div>' +
      '<div class="news-modal-container m9">' +
        '<button class="news-modal-close" aria-label="Tancar">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
        '</button>' +
        '<div class="m9-hero" style="' + heroStyle + '">' +
          (item.category || item.categoria ? '<span class="m9-tag">' + (item.category || item.categoria) + '</span>' : '') +
          '<span class="m9-tag">Notícia</span>' +
          (item.destacat || item.destacado ? '<span class="m9-tag">★ Destacat</span>' : '') +
        '</div>' +
        '<div class="m9-body">' +
          '<h2>' + (item.titul || item.titol || '') + '</h2>' +
          (item.subtitol ? '<h3>' + item.subtitol + '</h3>' : '') +
          rangeHTML +
          '<div class="m9-pills">' +
            (date ? 
            '<span class="m9-pill">' +
              '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
              date +
            '</span>' : '') +
            (location ? 
            '<span class="m9-pill">' +
              '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' +
              location +
            '</span>' : '') +
          '</div>' +
          '<div class="m9-text news-modal-body">' + (item.descripcio || '') + '</div>' +
          '<div class="m9-gallery">' +
            galleryItemsHTML +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  var modal = document.querySelector('.news-modal');
  var container = modal.querySelector('.news-modal-container');
  var overlay = modal.querySelector('.news-modal-overlay');
  var closeBtn = modal.querySelector('.news-modal-close');

  // Animació d'entrada
  modal.setAttribute('aria-hidden', 'false');
  gsap.set(modal, { display: 'flex', opacity: 0 });
  gsap.to(modal, { opacity: 1, duration: 0.3, ease: 'power2.out' });
  gsap.fromTo(container, 
    { scale: 0.9, opacity: 0, y: 30 }, 
    { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.05 }
  );

  // Append lightbox HTML if it doesn't exist
  var lightbox = document.getElementById('gallery-lightbox');
  if (!lightbox) {
    var lightboxHTML = 
      '<div class="vt-lightbox" id="gallery-lightbox" aria-hidden="true">' +
        '<button class="vt-lightbox-close" aria-label="Tancar">' +
          '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
        '</button>' +
        '<button class="vt-lightbox-prev" aria-label="Anterior">' +
          '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>' +
        '</button>' +
        '<div class="vt-lightbox-content">' +
          '<img class="vt-lightbox-img" src="" alt="Galeria">' +
        '</div>' +
        '<button class="vt-lightbox-next" aria-label="Següent">' +
          '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>' +
        '</button>' +
      '</div>';
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    lightbox = document.getElementById('gallery-lightbox');
  }

  var lightboxImg = lightbox.querySelector('.vt-lightbox-img');
  var lbCloseBtn = lightbox.querySelector('.vt-lightbox-close');
  var lbPrevBtn = lightbox.querySelector('.vt-lightbox-prev');
  var lbNextBtn = lightbox.querySelector('.vt-lightbox-next');

  var validImages = [];
  var activeIndex = 0;

  // Query gallery items
  var galleryItems = container.querySelectorAll('.m9-gallery div');
  galleryItems.forEach(function (div) {
    var bg = div.style.backgroundImage;
    if (bg && bg !== 'none' && !bg.includes('rgba')) {
      var url = bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
      validImages.push(url);

      div.style.cursor = 'pointer';
      div.addEventListener('click', function (e) {
        e.stopPropagation();
        activeIndex = validImages.indexOf(url);
        openLb();
      });
    }
  });

  function openLb() {
    updateLbImage();
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLb() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
  }

  function updateLbImage() {
    if (validImages.length === 0) return;
    lightboxImg.src = validImages[activeIndex];
  }

  function lbShowPrev() {
    if (validImages.length === 0) return;
    activeIndex = (activeIndex - 1 + validImages.length) % validImages.length;
    updateLbImage();
  }

  function lbShowNext() {
    if (validImages.length === 0) return;
    activeIndex = (activeIndex + 1) % validImages.length;
    updateLbImage();
  }

  lbCloseBtn.addEventListener('click', closeLb);
  lbPrevBtn.addEventListener('click', function(e) { e.stopPropagation(); lbShowPrev(); });
  lbNextBtn.addEventListener('click', function(e) { e.stopPropagation(); lbShowNext(); });
  lightbox.addEventListener('click', closeLb);
  lightboxImg.addEventListener('click', function(e) { e.stopPropagation(); });

  var lbKeyHandler = function (e) {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') {
      lbShowPrev();
    } else if (e.key === 'ArrowRight') {
      lbShowNext();
    } else if (e.key === 'Escape') {
      closeLb();
    }
  };
  document.addEventListener('keydown', lbKeyHandler);

  function closeModal() {
    closeLb();
    document.removeEventListener('keydown', lbKeyHandler);
    gsap.to(container, { scale: 0.9, opacity: 0, y: 30, duration: 0.3, ease: 'power3.in' });
    gsap.to(modal, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: function () {
        modal.remove();
      }
    });
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  
  var escHandler = function (e) {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

document.addEventListener('DOMContentLoaded', loadNoticias);
