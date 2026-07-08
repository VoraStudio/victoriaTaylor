/* ===========================================================
   api-artistes.js — Carrega artistes des del VoraCMS
   ===========================================================
   Obté els artistes publicats al VoraCMS via l'API pública
   i els afegeix al global `artistas` (el mateix objecte de
   artistas.js). D'aquesta manera tant la llista com la
   pàgina de detall funcionen sense duplicar lògica.

   Els artistes fixes (hardcodejats a artistas.js) NO es
   sobreescriuen. Els nous artistes del CMS s'afegeixen.
   =========================================================== */

(function () {
  /* ─── Config ─── */
  var BASE = typeof CMS_URL !== 'undefined' ? CMS_URL : 'http://127.0.0.1:8000';
  var API_TOKEN = typeof CMS_API_TOKEN !== 'undefined' ? CMS_API_TOKEN : 'UJIv45gTpMGckBdJjDg3UmkuqZzOWqHV';
  var API_URL = BASE + '/api/public/victoria-taylor/artistes_victoria_taylor';

  /* ─── Helpers ─── */

  /* Slugify: igual que PublicController::slugifyId() */
  function slugify(text) {
    var t = text.toLowerCase().trim();
    var map = { á:'a',é:'e',í:'i',ó:'o',ú:'u',à:'a',è:'e',ì:'i',ò:'o',ù:'u',ñ:'n',ü:'u' };
    t = t.replace(/[áéíóúàèìòùñü]/g, function (c) { return map[c] || c; });
    t = t.replace(/[^a-z0-9]+/g, '-');
    return t.replace(/^-|-$/g, '');
  }

  /* Crea l'objecte { es, ca, en } amb el mateix valor als tres idiomes */
  /* (El CMS guarda un sol valor, no traduccions) */
  function toLang(value) {
    return { es: value, ca: value, en: value };
  }

  /* Transforma una entry del CMS al format artistas.js */
  function transformEntry(entry, baseUrl) {
    var locale = entry.locale || 'ca';
    var titol = entry.titol || 'Artista';
    var id = slugify(titol) + '-' + entry.id;

    var imgUrl = null;
    if (entry.imatge && entry.imatge[0] && entry.imatge[0].url) {
      imgUrl = entry.imatge[0].url;
    }

    var bio = entry.descripcio
      ? entry.descripcio.split('\n').filter(function (p) { return p.trim(); })
      : [];

    /* Logros: [{ año, texto }] -> [{ año, textos: {es,ca,en} }] */
    var logros = (entry.logros || []).map(function (l) {
      var textos = l.texto
        ? l.texto.split('\n').filter(function (p) { return p.trim(); })
        : [];
      return {
        año: l.año || '',
        textos: toLang(textos, locale)
      };
    });

    /* Galeria -> obras: [{ img, titulo: {es,ca,en} }] */
    var obras = (entry.galeria || []).map(function (o) {
      return {
        img: o.url || null,
        titulo: toLang(o.name || '', locale)
      };
    });

    return {
      id: id,
      nombre: toLang(titol, locale),
      rol: toLang(entry.subtitol || '', locale),
      cardImg: imgUrl,
      heroImg: imgUrl,
      instagram: null,
      bio: toLang(bio, locale),
      logros: logros,
      obras: obras
    };
  }

  /* ─── Funció principal ─── */
  function loadApiArtistes() {
    return fetch(API_URL, {
        headers: { 'Authorization': 'Bearer ' + API_TOKEN }
      })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (response) {
        var entries = response && response.data;
        if (!entries || !Array.isArray(entries) || entries.length === 0) return;

        /* 1. Transformar i afegir al global `artistas` */
        if (typeof artistas === 'undefined') return;

        var nuevos = 0;
        entries.forEach(function (entry) {
          var artist = transformEntry(entry, BASE);
          if (!artistas[artist.id]) {
            artistas[artist.id] = artist;
            nuevos++;
          }
        });

        if (nuevos === 0) return;
        console.log('[API] Artistes del CMS afegits a artistas: ' + nuevos);

        /* 2. Detectar tipus de pàgina */
        var grid = document.querySelector('.about-artists-grid');
        if (!grid) {
          /* Pàgina de detall: disparar callback perque renderitzi */
          if (typeof window.__onArtistasReady === 'function') {
            window.__onArtistasReady();
          }
          return;
        }

        /* Llistar IDs existents al grid */
        var existents = new Set();
        grid.querySelectorAll('.artist-card-link').forEach(function (link) {
          var href = link.getAttribute('href');
          if (href) {
            var match = href.match(/id=([^&]+)/);
            if (match) existents.add(decodeURIComponent(match[1]));
          }
        });

        /* Afegir cards nomes dels que NO estiguin al grid */
        var afegides = 0;
        Object.keys(artistas).forEach(function (id) {
          if (existents.has(id)) return;
          var a = artistas[id];

          /* Saltar-se els artistes fixes que ja estan al grid */
          /* (per seguretat: si per alguna rao no van apareixer) */
          var nombre = (a.nombre && (a.nombre.ca || a.nombre.es)) || id;

          var link = document.createElement('a');
          link.href = 'artista.html?id=' + encodeURIComponent(id);
          link.className = 'artist-card-link';
          link.innerHTML =
            '<article class="artist-card">' +
              '<div class="artist-card-img">' +
                (a.cardImg
                  ? '<img src="' + a.cardImg + '" alt="' + nombre + '" loading="lazy">'
                  : '<div class="artist-card-placeholder"></div>') +
              '</div>' +
              '<h3 class="artist-card-name">' + nombre.toUpperCase() + '</h3>' +
            '</article>';

          grid.appendChild(link);

          /* Integrar al mateix stagger que les cards fixes */
          if (typeof gsap !== 'undefined' && window.__cardsAnim) {
            var c = window.__cardsAnim;
            var idx = c.cardCount; /* Posicio en el stagger (8a card = index 7) */

            gsap.set(link, { autoAlpha: 0, rotationY: -90, transformOrigin: 'left center' });

            if (!c.isPastStart && typeof ScrollTrigger !== 'undefined') {
              /* Scroll-triggered: animar amb el mateix trigger + delay de stagger */
              var artSec = document.querySelector('.about-artists');
              var alreadyPassed = artSec && artSec.getBoundingClientRect().top < window.innerHeight * 0.7;

              if (alreadyPassed) {
                /* El trigger ja hauria disparat. Comprovar si l'animacio encara corre */
                var animant = false;
                document.querySelectorAll('.artist-card-link').forEach(function (el) {
                  if (!animant) {
                    var tweens = gsap.getTweensOf(el);
                    animant = tweens.some(function (t) { return t.isActive(); });
                  }
                });
                var rem = animant
                  ? Math.max(0, idx * c.staggerEach - (performance.now() - c.animStart) / 1000)
                  : 0.2;
                gsap.to(link, {
                  autoAlpha: 1, rotationY: 0, duration: c.duration,
                  ease: c.ease, delay: rem
                });
              } else {
                /* Trigger no ha disparat: crear nou trigger amb delay de stagger */
                gsap.to(link, {
                  autoAlpha: 1, rotationY: 0, duration: c.duration,
                  ease: c.ease, delay: idx * c.staggerEach,
                  scrollTrigger: {
                    trigger: '.about-artists',
                    start: 'top 70%',
                    once: true
                  }
                });
              }
            } else {
              /* Time-based (isPastStart): calcular delay restant respecte al inicia */
              var elapsed = (performance.now() - c.animStart) / 1000;
              var myStart = c.baseDelay + idx * c.staggerEach;
              var remaining = Math.max(0.1, myStart - elapsed);

              gsap.to(link, {
                autoAlpha: 1, rotationY: 0, duration: c.duration,
                ease: c.ease, delay: remaining
              });
            }
          } else {
            link.style.visibility = 'visible';
          }
          afegides++;
        });

        if (afegides > 0) {
          console.log('[API] Cards noves afegides al grid: ' + afegides);
        }
      })
      .catch(function (err) {
        console.warn('[API] No s\'han pogut carregar artistes del CMS:', err.message);
      });
  }

  /* ─── Executar ─── */
  /* El fetch es asincron, per quan respongui el DOM ja esta llest */
  window.__apiArtistesLoaded = loadApiArtistes();
})();
