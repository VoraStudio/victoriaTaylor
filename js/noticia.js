/* ----- INICI ANIMACIÓ DETALL NOTÍCIA (SSR) ----- */
function initNoticiaEntrance() {
    const noticiaData = document.getElementById('ssr-noticia-data');
    if (!noticiaData) return;

    let noticia;
    try { noticia = JSON.parse(noticiaData.textContent); } catch (e) { return; }
    if (!noticia) return;

    /* Tracking */
    if (noticia.id) {
        navigator.sendBeacon('php/noticias.php?action=view&id=' + encodeURIComponent(noticia.id));
    }

    /* ===== HERO ENTRANCE (com initAboutEntrance) ===== */
    const labelEl = document.querySelector('.noticia-section-label');
    let labelSplit = null;
    if (labelEl) {
        labelSplit = vtSplit(labelEl, { type: 'chars' });
        if (labelSplit) {
            gsap.set(labelSplit.chars, { opacity: 0, yPercent: -50, scale: 0.5, rotationX: -90, transformOrigin: 'center bottom' });
        }
    }

    const titleEl = document.getElementById('noticia-title');
    let titleSplit = null;
    if (titleEl) {
        titleSplit = vtSplit(titleEl, { type: 'words,chars' });
        if (titleSplit) {
            gsap.set(titleSplit.chars, { opacity: 0, yPercent: -50, scale: 0.5, rotationX: -90, transformOrigin: 'center bottom' });
        }
    }

    gsap.set('.noticia-body', { opacity: 0, y: 20 });

    const tl = gsap.timeline({ delay: 0.5 });

    if (labelSplit) {
        tl.to(labelSplit.chars, {
            opacity: 1, yPercent: 0, scale: 1, rotationX: 0,
            duration: 1.2, stagger: { each: 0.04, from: 'start' }, ease: 'back.out(1.4)'
        }, 0);
    }

    if (titleSplit) {
        tl.to(titleSplit.chars, {
            opacity: 1, yPercent: 0, scale: 1, rotationX: 0,
            duration: 1.2, stagger: { each: 0.04, from: 'start' }, ease: 'back.out(1.4)'
        }, '-=0.3');
    }

    tl.to('.noticia-body', { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.4');
}


