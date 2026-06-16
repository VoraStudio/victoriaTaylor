/* ===========================================================
   artista-render.js — Pàgina individual d'artista
   ===========================================================
   Renderitza la fitxa completa d'un artista: hero, bio,
   timeline de logros, galeria d'obres + lightbox modal.

   Les dades provenen de l'objecte global 'artistas' (artistas.js).
   L'ID de l'artista es llegeix de la URL: artista.html?id=xxx
   =========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const main = document.getElementById('artist-content');
    if (!main) return;

    /* ----- INICI SECCIÓ LECTURA ID ----- */
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    /* Si no hi ha ID o l'artista no existeix, mostrem error */
    if (!id || !artistas[id]) {
        main.innerHTML = `
            <section class="artist-hero">
                <div class="artist-hero-bg" style="background-image: url('../img/slide1.webp');"></div>
                <div class="artist-hero-content">
                    <h1 class="artist-hero-title">Artista no trobat</h1>
                    <a href="artistas.html" class="btn-cta btn-primary">Tornar a Artistas</a>
                </div>
            </section>`;
        return;
    }

    const a = artistas[id];
    document.title = `Victoria Taylor | ${a.nombre}`;

    /* ----- INICI SECCIÓ CONSTRUCCIÓ HTML ----- */
    /* Timeline: any per any amb texts descriptius */
    let logrosHTML = '';
    if (a.logros && a.logros.length) {
        logrosHTML = a.logros.map(l => `
            <div class="artist-logro">
                <span class="artist-logro-any">${l.año}</span>
                <div class="artist-logro-textos">
                    ${l.textos.map(t => `<p>${t}</p>`).join('')}
                </div>
            </div>
        `).join('');
    }

    /* Galeria: graella d'obres clicables */
    let galeriaHTML = '';
    if (a.obras && a.obras.length) {
        galeriaHTML = a.obras.map((o, i) => `
            <article class="artist-obra">
                <div class="artist-obra-img">
                    <img src="${o.img}" alt="${o.titulo || `Obra ${i + 1}`}" loading="lazy">
                </div>
                ${o.titulo ? `<h3 class="artist-obra-titulo">${o.titulo}</h3>` : ''}
            </article>
        `).join('');
    }

    /* Muntatge del HTML complet al contenidor principal */
    main.innerHTML = `
        <!-- Hero: imatge fons + títol + rol + Instagram -->
        <section class="artist-hero" aria-label="${a.nombre}">
            <div class="artist-hero-bg" style="background-image: url('${a.heroImg}');${a.bgPosition ? ` background-position: ${a.bgPosition};` : ''}"></div>
            <div class="artist-hero-overlay"></div>
            <div class="artist-hero-content">
                ${a.rol ? `<span class="artist-hero-rol">${a.rol}</span>` : ''}
                <h1 class="artist-hero-title">${a.nombre}</h1>
                ${a.instagram ? `<a href="${a.instagram}" target="_blank" rel="noopener" class="artist-hero-ig" aria-label="Instagram de ${a.nombre}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    <span>Instagram</span>
                </a>` : ''}
            </div>
        </section>

        <!-- Bio: text descriptiu de l'artista -->
        ${a.bio ? `
        <section class="artist-bio">
            <div class="artist-bio-inner">
                <h2 class="section-label">Sobre l'artista</h2>
                <div class="artist-bio-text">
                    ${a.bio.map(p => `<p>${p}</p>`).join('')}
                </div>
            </div>
        </section>` : ''}

        <!-- Logros / Timeline: línia temporal amb fites -->
        ${logrosHTML ? `
        <section class="artist-logros">
            <div class="artist-logros-inner">
                <h2 class="section-label">Trajectòria</h2>
                <div class="artist-timeline">
                    ${logrosHTML}
                </div>
            </div>
        </section>` : ''}

        <!-- Galeria: graella d'obres -->
        ${galeriaHTML ? `
        <section class="artist-galeria">
            <div class="artist-galeria-inner">
                <h2 class="section-label">Obras</h2>
                <div class="artist-obras-grid">
                    ${galeriaHTML}
                </div>
            </div>
        </section>` : ''}
    `;

    /* ===========================================================
       ANIMACIONS GSAP
       =========================================================== */

    /* Hero: el títol entra amb split chars 3D */
    const heroTitle = document.querySelector('.artist-hero-title');
    if (heroTitle) {
        const split = new SplitText(heroTitle, { type: 'words,chars' });
        gsap.from(split.chars, {
            opacity: 0, y: 80, rotateX: -90, stagger: 0.04,
            duration: 1, ease: 'power4.out', delay: 0.3
        });
    }

    /* Rol i enllaç Instagram: fade + slide up */
    gsap.from('.artist-hero-rol, .artist-hero-ig', {
        opacity: 0, y: 30, duration: 1, ease: 'power3.out',
        delay: 0.8, stagger: 0.15
    });

    /* Bio: les línies de text es revelen en fer scroll */
    gsap.set('.artist-bio-text p', { perspective: '800px', transformStyle: 'preserve-3d' });
    let bio = new SplitText('.artist-bio-text p', { type: 'lines', mask: "lines" });
    gsap.from(bio.lines, {
        opacity: 0, y: 40, duration: 1, ease: 'power3.out', stagger: 0.2,
        scrollTrigger: { trigger: '.artist-bio', start: 'top 60%', toggleActions: 'play none none reverse' }
    });

    /* Timeline: cada logro entra desde l'esquerra */
    gsap.from('.artist-logro', {
        opacity: 0, x: -60, duration: 0.8, ease: 'power3.out', stagger: 0.3,
        scrollTrigger: { trigger: '.artist-logros', start: 'top 65%', toggleActions: 'play none none reverse' }
    });

    /* Galeria: les obres apareixen amb fade + slide up */
    gsap.from('.artist-obra', {
        opacity: 0, y: 60, duration: 0.8, ease: 'power3.out', stagger: 0.2,
        scrollTrigger: { trigger: '.artist-galeria', start: 'top 60%', toggleActions: 'play none none reverse' }
    });

    /* Parallax del fons del hero */
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
       ===========================================================
       En clicar una obra, s'obre un visor a pantalla completa
       amb navegació (anterior/següent) i tancament amb Escape.
       =========================================================== */
    const obraEls = document.querySelectorAll('.artist-obra');
    const obras = a.obras;

    if (obraEls.length && obras.length) {
        /* Injectem l'HTML del modal al final del body */
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

        /* Assignem click a cada obra per obrir el modal */
        obraEls.forEach((el, i) => {
            el.style.cursor = 'pointer';
            el.addEventListener('click', () => openModal(i));
        });

        /* Obre el modal amb animació GSAP */
        function openModal(idx) {
            currentIdx = idx;
            modalImg.src = obras[idx].img;
            modalImg.alt = obras[idx].titulo || `Obra ${idx + 1}`;
            modalTitulo.textContent = obras[idx].titulo || '';
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            gsap.set(modal, { visibility: 'visible', opacity: 0 });
            gsap.to(modal, { opacity: 1, duration: 0.4, ease: 'power2.out' });
            gsap.fromTo(modalImg.parentElement, { scale: 0.85, opacity: 0 }, {
                scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out'
            });
        }

        /* Tanca el modal amb animació inversa */
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

        /* Navega entre obres (amb wrap around) */
        function navigate(dir) {
            currentIdx = (currentIdx + dir + obras.length) % obras.length;
            modalImg.src = obras[currentIdx].img;
            modalImg.alt = obras[currentIdx].titulo || `Obra ${currentIdx + 1}`;
            modalTitulo.textContent = obras[currentIdx].titulo || '';
            gsap.fromTo(modalImg.parentElement,
                { scale: 0.9, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.4, ease: 'power3.out' }
            );
        }

        /* Events: botons, overlay i teclat */
        modalClose.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('artista-modal-overlay')) closeModal();
        });
        modalPrev.addEventListener('click', () => navigate(-1));
        modalNext.addEventListener('click', () => navigate(1));

        document.addEventListener('keydown', (e) => {
            if (modal.getAttribute('aria-hidden') === 'false') {
                if (e.key === 'Escape') closeModal();
                if (e.key === 'ArrowLeft') navigate(-1);
                if (e.key === 'ArrowRight') navigate(1);
            }
        });
    }
});
