/* ===========================================================
   artista-render.js — Pàgina individual d'artista
   ===========================================================
   Renderitza la fitxa completa d'un artista: hero, bio,
   timeline de logros, galeria d'obres + lightbox modal.

   Les dades provenen de l'objecte global 'artistas' (artistas.js).
   L'ID de l'artista es llegeix de la URL: artista.html?id=xxx
   =========================================================== */

/* Injectar keyframes per al spinner de loading */
(function () {
    var style = document.createElement('style');
    style.textContent = '@keyframes artistSpin { to { transform: rotate(360deg); } }';
    document.head.appendChild(style);
})();

/* ---------- Helpers d'internacionalització ---------- */
const labels = {
    es: { sobre: 'Sobre el artista', trayectoria: 'Trayectoria', obras: 'Obras' },
    ca: { sobre: 'Sobre l\'artista', trayectoria: 'Trajectòria', obras: 'Obres' },
    en: { sobre: 'About the Artist', trayectoria: 'Timeline', obras: 'Works' }
};



function _t(obj) {
    if (typeof obj === 'string') return obj;
    if (obj && typeof obj === 'object') return obj[window.vtArtistLang] ?? obj.es ?? '';
    return '';
}

/* ---------- Keydown handler ref per netejar en re-render ---------- */
let _keydownHandler = null;

function renderArtist(lang) {
    window.vtArtistLang = lang;
    const main = document.getElementById('artist-content');
    if (!main) return;

    const currentLabels = labels[lang] || labels.es;

    /* ----- Llegir ID de la URL ----- */
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id || !artistas[id]) {
        /* No mostrar error - api-artistes.js el carregara i cridara el callback */
        return;
    }

    /* ----- INICI SECCIÓ CONSTRUCCIÓ HTML ----- */

    const a = artistas[id];
    const nombre = _t(a.nombre);
    document.title = `Victoria Taylor | ${nombre}`;

    /* Timeline */
    let logrosHTML = '';
    if (a.logros && a.logros.length) {
        logrosHTML = a.logros.map(l => {
            const textos = _t(l.textos);
            return `
            <div class="artist-logro">
                <span class="artist-logro-any">${l.año}</span>
                <div class="artist-logro-textos">
                    ${Array.isArray(textos) ? textos.map(t => `<p>${t}</p>`).join('') : ''}
                </div>
            </div>
        `;
        }).join('');
    }

    /* Galeria */
    let galeriaHTML = '';
    if (a.obras && a.obras.length) {
        galeriaHTML = a.obras.map((o, i) => {
            const titulo = _t(o.titulo);
            return `
            <article class="artist-obra">
                <div class="artist-obra-img">
                    <img src="${o.img}" alt="${titulo || `Obra ${i + 1}`}" loading="lazy">
                </div>
                ${titulo ? `<h3 class="artist-obra-titulo">${titulo}</h3>` : ''}
            </article>
        `;
        }).join('');
    }

    const bio = _t(a.bio);

    /* Netejar GSAP i modal vells abans de re-renderitzar */
    ScrollTrigger.getAll().forEach(t => t.kill());
    const oldModal = document.querySelector('.artista-modal');
    if (oldModal) oldModal.remove();
    if (_keydownHandler) {
        document.removeEventListener('keydown', _keydownHandler);
        _keydownHandler = null;
    }

    /* Renderitzar HTML */
    main.innerHTML = `
        <section class="artist-hero" aria-label="${nombre}">
            <div class="artist-hero-bg" style="background-image: url('${a.heroImg}');${a.bgPosition ? ` background-position: ${a.bgPosition};` : ''}"></div>
            <div class="artist-hero-overlay"></div>
            <div class="artist-hero-content">
                ${a.rol ? `<span class="artist-hero-rol">${_t(a.rol)}</span>` : ''}
                <h1 class="artist-hero-title">${nombre}</h1>
                ${a.instagram ? `<a href="${a.instagram}" target="_blank" rel="noopener" class="artist-hero-ig" aria-label="${nombre}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    <span>Instagram</span>
                </a>` : ''}
            </div>
        </section>

        ${Array.isArray(bio) && bio.length ? `
        <section class="artist-bio">
            <div class="artist-bio-inner">
                <h2 class="section-label">${currentLabels.sobre}</h2>
                <div class="artist-bio-text">
                    ${bio.map(p => `<p>${p}</p>`).join('')}
                </div>
            </div>
        </section>` : ''}

        ${logrosHTML ? `
        <section class="artist-logros">
            <div class="artist-logros-inner">
                <h2 class="section-label">${currentLabels.trayectoria}</h2>
                <div class="artist-timeline">
                    ${logrosHTML}
                </div>
            </div>
        </section>` : ''}

        ${galeriaHTML ? `
        <section class="artist-galeria">
            <div class="artist-galeria-inner">
                <h2 class="section-label">${currentLabels.obras}</h2>
                <div class="artist-obras-grid">
                    ${galeriaHTML}
                </div>
            </div>
        </section>` : ''}
    `;

    /* ===========================================================
       ANIMACIONS GSAP
       =========================================================== */

    const heroTitle = document.querySelector('.artist-hero-title');
    if (heroTitle) {
        const split = new SplitText(heroTitle, { type: 'words,chars' });
        gsap.from(split.chars, {
            opacity: 0, y: 80, rotateX: -90, stagger: 0.04,
            duration: 1, ease: 'power4.out', delay: 0.3
        });
    }

    gsap.from('.artist-hero-rol, .artist-hero-ig', {
        opacity: 0, y: 30, duration: 1, ease: 'power3.out',
        delay: 0.8, stagger: 0.15
    });

    gsap.set('.artist-bio-text p', { perspective: '800px', transformStyle: 'preserve-3d' });
    const bioSplit = new SplitText('.artist-bio-text p', { type: 'lines', mask: "lines" });
    gsap.from(bioSplit.lines, {
        opacity: 0, y: 40, duration: 1, ease: 'power3.out', stagger: 0.2,
        scrollTrigger: { trigger: '.artist-bio', start: 'top 60%', toggleActions: 'play none none reverse' }
    });

    gsap.from('.artist-logro', {
        opacity: 0, x: -60, duration: 0.8, ease: 'power3.out', stagger: 0.3,
        scrollTrigger: { trigger: '.artist-logros', start: 'top 65%', toggleActions: 'play none none reverse' }
    });

    gsap.from('.artist-obra', {
        opacity: 0, y: 60, duration: 0.8, ease: 'power3.out', stagger: 0.2,
        scrollTrigger: { trigger: '.artist-galeria', start: 'top 60%', toggleActions: 'play none none reverse' }
    });

    const heroBg = document.querySelector('.artist-hero-bg');
    if (heroBg) {
        gsap.to(heroBg, {
            yPercent: 15, ease: 'none',
            scrollTrigger: { trigger: '.artist-hero', start: 'top top', end: 'bottom top', scrub: 1 }
        });
    }

    ScrollTrigger.refresh();

    /* ===========================================================
       MODAL / LIGHTBOX
       =========================================================== */
    const obraEls = document.querySelectorAll('.artist-obra');
    const obras = a.obras;

    if (obraEls.length && obras.length) {
        const modalHTML = `
            <div class="artista-modal" aria-hidden="true" role="dialog" aria-label="Visor d'obra">
                <div class="artista-modal-overlay"></div>
                <button class="artista-modal-close" aria-label="Tancar visor">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                </button>
                <button class="artista-modal-prev" aria-label="Anterior obra">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button class="artista-modal-next" aria-label="Següent obra">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
                </button>
                <div class="artista-modal-content">
                    <img class="artista-modal-img" src="" alt="">
                    <p class="artista-modal-titulo"></p>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.querySelector('.artista-modal');
        const modalImg = modal.querySelector('.artista-modal-img');
        const modalTitulo = modal.querySelector('.artista-modal-titulo');
        const modalClose = modal.querySelector('.artista-modal-close');
        const modalPrev = modal.querySelector('.artista-modal-prev');
        const modalNext = modal.querySelector('.artista-modal-next');
        let currentIdx = 0;

        obraEls.forEach((el, i) => {
            el.style.cursor = 'pointer';
            el.addEventListener('click', () => openModal(i));
        });

        function openModal(idx) {
            currentIdx = idx;
            const titulo = _t(obras[idx].titulo);
            modalImg.src = obras[idx].img;
            modalImg.alt = titulo || `Obra ${idx + 1}`;
            modalTitulo.textContent = titulo || '';
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            gsap.set(modal, { visibility: 'visible', opacity: 0 });
            gsap.to(modal, { opacity: 1, duration: 0.4, ease: 'power2.out' });
            gsap.fromTo(modalImg.parentElement, { scale: 0.85, opacity: 0 }, {
                scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out'
            });
        }

        function closeModal() {
            gsap.to(modalImg.parentElement, { scale: 0.85, opacity: 0, duration: 0.3, ease: 'power2.in' });
            gsap.to(modal, {
                opacity: 0, duration: 0.3, ease: 'power2.in',
                onComplete: () => {
                    modal.setAttribute('aria-hidden', 'true');
                    gsap.set(modal, { visibility: 'hidden' });
                    document.body.style.overflow = '';
                }
            });
        }

        function navigate(dir) {
            currentIdx = (currentIdx + dir + obras.length) % obras.length;
            const titulo = _t(obras[currentIdx].titulo);
            modalImg.src = obras[currentIdx].img;
            modalImg.alt = titulo || `Obra ${currentIdx + 1}`;
            modalTitulo.textContent = titulo || '';
            gsap.fromTo(modalImg.parentElement,
                { scale: 0.9, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.4, ease: 'power3.out' }
            );
        }

        modalClose.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('artista-modal-overlay')) closeModal();
        });
        modalPrev.addEventListener('click', () => navigate(-1));
        modalNext.addEventListener('click', () => navigate(1));

        _keydownHandler = (e) => {
            if (modal.getAttribute('aria-hidden') === 'false') {
                if (e.key === 'Escape') closeModal();
                if (e.key === 'ArrowLeft') navigate(-1);
                if (e.key === 'ArrowRight') navigate(1);
            }
        };
        document.addEventListener('keydown', _keydownHandler);
    }
}

window.renderArtist = renderArtist;

/* Quan api-artistes.js mergeja les dades, crida aquest callback */
window.__onArtistasReady = function () {
    var lang = localStorage.getItem('vt-lang') || 'es';
    document.fonts.ready.then(function () {
        renderArtist(lang);
    });
};

document.addEventListener('DOMContentLoaded', function () {
    var lang = localStorage.getItem('vt-lang') || 'es';
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');

    /* Si l'artista ja esta a artistas (fix), renderitzar directe */
    if (id && artistas[id]) {
        document.fonts.ready.then(function () {
            renderArtist(lang);
        });
        return;
    }

    /* Mostrar loading mentre api-artistes.js carrega les dades del CMS */
    if (id) {
        var main = document.getElementById('artist-content');
        if (main) {
            main.innerHTML =
                '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:1.5rem">' +
                    '<div class="artist-loading-spinner" style="width:40px;height:40px;border:3px solid rgba(255,255,255,0.15);border-top-color:#fff;border-radius:50%;animation:artistSpin 0.8s linear infinite"></div>' +
                    '<span style="color:#fff;font-family:var(--font-primary);font-size:0.85rem;letter-spacing:0.2em;text-transform:uppercase;opacity:0.6">Carregant artista...</span>' +
                '</div>';
        }
    }
    /* api-artistes.js cridara __onArtistasReady quan mergeji */
});
