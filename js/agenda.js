/* ----- INICI ANIMACIÓ LLISTAT AGENDA (SSR) ----- */
document.addEventListener('DOMContentLoaded', function() {
    /* ===== HERO ENTRANCE (SplitText com totes les pàgines) ===== */
    var heroTitle = document.querySelector('.agenda-hero-title');
    var heroSplit = null;
    if (heroTitle && typeof SplitText !== 'undefined') {
        heroSplit = new SplitText(heroTitle, { type: 'words,chars' });
        heroTitle.style.visibility = 'visible';
        gsap.set(heroSplit.chars, { opacity: 0, yPercent: -50, scale: 0.5, rotationX: -90, transformOrigin: 'center bottom' });
    }

    var heroTl = gsap.timeline({ delay: 0.5 });
    if (heroSplit) {
        heroTl.to(heroSplit.chars, {
            opacity: 1, yPercent: 0, scale: 1, rotationX: 0,
            duration: 1.2, stagger: { each: 0.04, from: 'start' }, ease: 'back.out(1.4)'
        }, 0);
    }

    gsap.set('.agenda-hero-label, .agenda-hero-subtitle', { opacity: 0, y: 20 });
    heroTl.to('.agenda-hero-label', { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.8');
    heroTl.to('.agenda-hero-subtitle', { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.6');

    /* ===== PESTANTES: Pròxims / Històric ===== */
    var tabUp = document.getElementById('agenda-tab-upcoming');
    var tabHist = document.getElementById('agenda-tab-historical');

    function switchTab(tab) {
        var isUp = tab === tabUp;
        tabUp.classList.toggle('is-active', isUp);
        tabUp.setAttribute('aria-selected', isUp);
        tabHist.classList.toggle('is-active', !isUp);
        tabHist.setAttribute('aria-selected', !isUp);

        document.querySelectorAll('.agenda-card').forEach(function(card) {
            var cat = card.getAttribute('data-category');
            card.style.display = isUp ? (cat === 'upcoming' ? '' : 'none') : (cat === 'historical' ? '' : 'none');
        });

        /* Mostrar o amagar missatge de buit */
        var visibleCards = document.querySelectorAll('.agenda-card[style*=\"display: \"], .agenda-card:not([style])');
        var hasVisible = Array.from(visibleCards).some(function(c) {
            var display = window.getComputedStyle(c).display;
            return display !== 'none';
        });
        var emptyMsg = document.getElementById('agenda-empty-' + (isUp ? 'upcoming' : 'historical'));
        if (!hasVisible && emptyMsg) emptyMsg.style.display = '';
    }

    if (tabUp) {
        tabUp.addEventListener('click', function() { switchTab(tabUp); });
    }
    if (tabHist) {
        tabHist.addEventListener('click', function() { switchTab(tabHist); });
    }

    /* Default: mostrar el tab que tingui events, o Pròxims si no n'hi ha */
    var tabUpcomingCount = parseInt(document.getElementById('agenda-count-upcoming')?.textContent?.replace(/[()]/g, '') || '0', 10);
    var tabHistCount = parseInt(document.getElementById('agenda-count-historical')?.textContent?.replace(/[()]/g, '') || '0', 10);
    var defaultTab = tabUpcomingCount > 0 ? tabUp : (tabHistCount > 0 ? tabHist : tabUp);
    if (defaultTab) switchTab(defaultTab);

    /* ===== ANIMACIÓ CARDS EN SCROLL ===== */
    var cards = document.querySelectorAll('.agenda-card');
    if (cards.length && typeof gsap !== 'undefined') {
        cards.forEach(function(c) { c.style.visibility = 'visible'; });
        gsap.fromTo(cards,
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 1.5,
                ease: 'power3.inOut',
                stagger: 0.35,
                scrollTrigger: {
                    trigger: '.agenda-list-wrap',
                    start: 'top 90%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    }
});