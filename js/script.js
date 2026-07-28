/* ----- INICI SECCIÓ HEADER ANIMATIONS ----- */
// Animacions Header
function initHeaderAnimations() {
    const headerTl = gsap.timeline({ delay: 0.3 });
    
    // Entrada logo
    headerTl.from(".header-logo", {
        opacity: 0,
        y: 20,
        duration: 1.5,
        ease: "power4.out"
    });

    // Seleccionem el text original i el que es crea dinamicament
    const navLinks = document.querySelectorAll(".nav-link .txt-original");
    navLinks.forEach((link, index) => {
        const split = new SplitText(link, { type: "chars", mask: "lines" });
        headerTl.from(split.chars, {
            opacity: 0,
            y: 10,
            stagger: 0.05,
            duration: 0.5,
            ease: "power3.out"
            //Entras sequencial adelantada
        }, `-=${0.7 - (index * 0.1)}`);
    });

    // Animen el botó de menú (mòbil)
    headerTl.from(".menu-toggle", {
        opacity: 0,
        scale: 0.8,
        duration: 1,
        ease: "back.out(1.7)"
    }, "-=2.8");
}

// Funció per al Menú Hamburguesa i Navegació Mòbil
function initMobileMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");
    const mobileLinks = document.querySelectorAll(".mobile-link"); 
    let isMenuOpen = false;

    // Preparem els links mòbils per a SplitText (animació d'entrada del menú)
    const mobileSplits = Array.from(document.querySelectorAll(".mobile-link .txt-original")).map(link => new SplitText(link, { type: "chars, lines", mask: "lines" }));

    menuToggle.addEventListener("click", () => {
        isMenuOpen = !isMenuOpen;
        //Animació del icone menu hamburguesa
        menuToggle.classList.toggle("is-active");
        mobileNav.classList.toggle("is-open");

        const tl = gsap.timeline();

        if (isMenuOpen) {
            gsap.set(mobileNav, { visibility: "visible" });
            //Entrada del menu mobil (fons)
            tl.to(mobileNav, {
                yPercent: 100,
                duration: 0.2,
                ease: "expo.inOut"
            });

            //Entrada links 
            mobileSplits.forEach((split, i) => {
                tl.fromTo(split.chars, {
                    opacity: 0,
                    y: 100,
                    rotateX: -90,
                }, {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    stagger: 0.03,
                    duration: 0.3,
                    ease: "power4.out"
                }, `>`);
            });
            //Sortida links
        } else {
            mobileSplits.forEach((split, i) => {
                tl.to(split.chars, {
                    opacity: 0,
                    y: -100,
                    stagger: 0.01,
                    duration: 0.5,
                    ease: "power4.in"
                }, 0);
            });
            
            //Sortida del menu mobil (fons)
            tl.to(mobileNav, {
                yPercent: 0,
                duration: 0.2,
                ease: "expo.inOut",
                onComplete: () => {
                    //Reiniciem
                    gsap.set(mobileNav, { visibility: "hidden" });
                    mobileSplits.forEach(split => gsap.set(split.chars, { opacity: 0, y: 100 }));
                }
            });
        }
    });

    mobileLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (isMenuOpen) menuToggle.click();
        });
    });
}

// Efecte de Hover Premium per als Links del Header (Desktop i Mòbil)
function initNavHover() {
    const navLinks = document.querySelectorAll(".nav-link, .mobile-link");
    
    navLinks.forEach(link => {
        const text = link.textContent.trim();
        link.innerHTML = `
            <div class="split-mask">
                <span class="txt-original">${text}</span>
                <span class="txt-clone">${text}</span>
            </div>
        `;

        const original = link.querySelector(".txt-original");
        const clone = link.querySelector(".txt-clone");

        gsap.set(link.querySelector(".split-mask"), { position: "relative", overflow: "hidden", display: "inline-block" });
        gsap.set(clone, { position: "absolute", top: "100%", left: 0, color: "var(--color-cream)" });

        const splitOriginal = new SplitText(original, { type: "chars", mask: "lines" });
        const splitClone = new SplitText(clone, { type: "chars", mask: "lines" });

        const tl = gsap.timeline({ paused: true });
        tl.to(splitOriginal.chars, { yPercent: -100, stagger: 0.02, duration: 0.4, ease: "power2.inOut" })
          .to(splitClone.chars, { yPercent: -100, stagger: 0.02, duration: 0.4, ease: "power2.inOut" }, 0);

        link.addEventListener("mouseenter", () => tl.play());
        link.addEventListener("mouseleave", () => tl.reverse());
    });
}

/* ----- INICI SECCIÓ SWIPER + GSAP ----- */

// Registrem els plugins de GSAP
gsap.registerPlugin(ScrollTrigger, SplitText);

// Variable de control per evitar solapaments d'animacions
let isAnimating = false;

// Inicialitzem Swiper (només si existeix un slider a la pàgina)
const swiperEl = document.querySelector(".mySwiper");
const swiper = swiperEl ? new Swiper(swiperEl, {
    speed: 1600, 
    loop: true,
    parallax: true,
    mousewheel: false,
    pagination: { //Paginació inferior
        el: ".swiper-pagination",
        clickable: true,
    },
    navigation: { //FLetxes de navegació
        nextEl: ".next-btn",
        prevEl: ".prev-btn",
    },
    on: { //onMounted
        init: function() {
            //Al element actiu, animació de zooom out
            const activeBg = document.querySelector(".swiper-slide-active .slide-bg");
            gsap.fromTo(activeBg, { scale: 1.4, filter: "brightness(0.9)" }, { scale: 1, duration: 2.5, ease: "power2.out", filter: "brightness(0.2)" });
        },
        slideChangeTransitionEnd: function() {
            //.swiper-slide-active clase automatica del Swiper
            const activeBg = document.querySelector(".swiper-slide-active .slide-bg");
            const activeContent = document.querySelector(".swiper-slide-active .slide-content");

            // Animació de zoom in
            gsap.fromTo(activeBg, { scale: 0.75, filter: "brightness(0.2)" }, { scale: 1, duration: 1.2, ease: "power4.out", filter: "brightness(0.9)", onComplete: () => { isAnimating = false; } });
            
            //Animació del Text
            gsap.fromTo(activeContent, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.4 });
        }
    }
}) : null;

// INTERCEPTOR DE LA RODA (només si hi ha slider)
if (swiper) {
window.addEventListener('wheel', (e) => {
    // Evitem solapaments
    if (isAnimating) return;

    // Si es mou la roda mes de 40px, fem la transició
    if (Math.abs(e.deltaY) > 40) {
        isAnimating = true;
        const allBgs = document.querySelectorAll(".slide-bg");
        const allContent = document.querySelectorAll(".slide-content");
        // Reduim la escala i moguem les imatges
        gsap.to(allBgs, {
            scale: 0.75,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
                if (e.deltaY > 0) swiper.slideNext();
                else swiper.slidePrev();
            }
        });

        // Fade Out del text
        gsap.to(allContent, { opacity: 0, y: 30, duration: 0.5, ease: "power2.inOut" });
    }
}, { passive: true });
} // fi del guard swiper

// SplitText del botons Anterior i Seguent
function hoverNextPrev(selector) {
    const items = document.querySelectorAll(selector);
    
    items.forEach(item => {
        const text = item.textContent.trim();
        // Creem l'estructura de doble capa per a la màscara
        item.innerHTML = `
            <div class="split-mask">
                <div class="split-txt original">${text}</div>
                <div class="split-txt clone">${text}</div>
            </div>
        `;
        const original = item.querySelector('.original');
        const clone = item.querySelector('.clone');
        
        // Dividim amb SplitText
        const splitOriginal = new SplitText(original, { type: "chars", mask: "lines" });
        const splitClone = new SplitText(clone, { type: "chars", mask: "lines" });
        
        // Creem una línia de temps GSAP per al hover
        const tl = gsap.timeline({ paused: true });
        tl.to(splitOriginal.chars, { yPercent: -100, stagger: 0.03, duration: 0.3, ease: "power2.inOut" })
          .to(splitClone.chars, { yPercent: -100, stagger: 0.03, duration: 0.3, ease: "power2.inOut" }, 0);

        item.addEventListener("mouseenter", () => tl.play());
        item.addEventListener("mouseleave", () => tl.reverse());
    });
}

// Inicialitzem l'efecte als botons PREV i NEXT (només si existeixen)
if (document.querySelector('.nav-arrow')) {
    hoverNextPrev('.nav-arrow');
}

/* ----- INICI SECCIÓ ABOUT ENTRANCE (nosotros.html) ----- */
function initAboutEntrance() {
    // ============================================
    // 0. SET INITIAL STATE — hero only (timeline plays on load)
    // ============================================
        const heroTitle = document.querySelector('.about-hero-title');
        let heroSplit = null;
        if (heroTitle) {
            heroSplit = new SplitText(heroTitle, { type: "words,chars" });
            heroTitle.style.visibility = 'visible'; // override CSS .js-enabled rule BEFORE GSAP captures "to" state
            gsap.set(heroSplit.chars, { opacity: 0, yPercent: -50, scale: 0.5, rotationX: -90, transformOrigin: "center bottom" });
        }
        gsap.set('.about-text-main p, .about-text-side p, .btn-cta', { opacity: 0, y: 30 });

        // ============================================
        // 1. HERO ENTRANCE (on load)
        // ============================================
        const heroTl = gsap.timeline({ delay: 0.5 });

        if (heroSplit) {
            heroTl.to(heroSplit.chars, {
                opacity: 1, yPercent: 0, scale: 1, rotationX: 0,
                duration: 1.2, stagger: { each: 0.04, from: "start" }, ease: "back.out(1.4)"
            }, 0);
        }
    heroTl.to('.about-text-main p', { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.4");
    heroTl.to('.about-text-side p', { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.6");
    heroTl.to('.btn-cta', { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }, "-=0.6");

    // ============================================
    // 2. SECTION — animate via ScrollTrigger or immediately if already visible
    // ============================================
    const artSec = document.querySelector('.about-artists');
    const artSecTop = artSec ? artSec.getBoundingClientRect().top : Infinity;
    const isPastStart = artSecTop < window.innerHeight * 0.8;

    const artTitle = document.querySelector('.about-artists-title');
    if (artTitle) {
        artTitle.style.visibility = 'visible'; // override CSS .js-enabled BEFORE GSAP captures "to" state
        const artSplit = new SplitText(artTitle, { type: "chars" });

        if (isPastStart) {
            // Section already visible — play immediately with slight delay
            gsap.set(artSplit.chars, { autoAlpha: 0, yPercent: 80, rotationX: -90, transformOrigin: "top center" });
            gsap.to(artSplit.chars, {
                autoAlpha: 1, yPercent: 0, rotationX: 0,
                duration: 0.7, stagger: { each: 0.04, from: "start" }, ease: "power3.out",
                delay: 0.3
            });
        } else {
            // Section below fold — ScrollTrigger
            gsap.from(artSplit.chars, {
                autoAlpha: 0, yPercent: 80, rotationX: -90, transformOrigin: "top center",
                duration: 1, stagger: { each: 0.06, from: "start" }, ease: "power3.out",
                scrollTrigger: { trigger: '.about-artists', start: 'top 80%', once: true }
            });
        }
    }

    // Subtitle
    const artSubtitle = document.querySelector('.about-artists-subtitle');
    if (artSubtitle) {
        artSubtitle.style.visibility = 'visible'; // override CSS .js-enabled rule
        if (isPastStart) {
            gsap.set(artSubtitle, { autoAlpha: 0, y: 20 });
            gsap.to(artSubtitle, {
                autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 1
            });
        } else {
            gsap.from(artSubtitle, {
                autoAlpha: 0, y: 20, duration: 0.8, ease: "power2.out",
                scrollTrigger: { trigger: '.about-artists', start: 'top 80%', once: true }
            });
        }
    }

    // ============================================
    // 3. CARDS — Despliegue Cinemático 3D "Izquierda"
    // ============================================
    const cards = document.querySelectorAll('.artist-card-link');
    if (cards.length) {
        cards.forEach(card => card.style.visibility = 'visible'); // override CSS .js-enabled rule
        gsap.set('.about-artists-grid', { perspective: 1200 });

        if (isPastStart) {
            gsap.set(cards, { autoAlpha: 0, rotationY: -90, transformOrigin: "left center" });
            gsap.to(cards, {
                autoAlpha: 1, rotationY: 0, duration: 1.2,
                stagger: { each: 0.5, from: "start" }, ease: "power3.out",
                delay: 0.5
            });
        } else {
            gsap.from(cards, {
                autoAlpha: 0, rotationY: -90, transformOrigin: "left center",
                duration: 1.2, stagger: { each: 0.5, from: "start" }, ease: "power3.out",
                scrollTrigger: { trigger: '.about-artists', start: 'top 70%', once: true }
            });
        }

        /* Exposar config perque api-artistes.js pugui integrar noves cards al mateix stagger */
        window.__cardsAnim = {
            isPastStart: isPastStart,
            cardCount: cards.length,
            staggerEach: 0.5,
            baseDelay: 0.5,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: isPastStart ? null : { trigger: '.about-artists', start: 'top 70%' },
            animStart: performance.now()
        };
    }
}

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
        labelSplit = new SplitText(labelEl, { type: 'chars' });
        gsap.set(labelSplit.chars, { opacity: 0, yPercent: -50, scale: 0.5, rotationX: -90, transformOrigin: 'center bottom' });
    }

    const titleEl = document.getElementById('noticia-title');
    let titleSplit = null;
    if (titleEl) {
        titleSplit = new SplitText(titleEl, { type: 'words,chars' });
        gsap.set(titleSplit.chars, { opacity: 0, yPercent: -50, scale: 0.5, rotationX: -90, transformOrigin: 'center bottom' });
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

/* ----- INICI ANIMACIÓ DETALL EVENT (SSR) ----- */
function initEventoEntrance() {
    var titleEl = document.getElementById('evento-title');
    if (!titleEl) return;

    if (typeof SplitText !== 'undefined') {
        var titleSplit = new SplitText(titleEl, { type: 'words,chars' });
        titleEl.style.visibility = 'visible';
        gsap.set(titleSplit.chars, { opacity: 0, yPercent: -50, scale: 0.5, rotationX: -90, transformOrigin: 'center bottom' });

        var tl = gsap.timeline({ delay: 0.5 });

        tl.to(titleSplit.chars, {
            opacity: 1, yPercent: 0, scale: 1, rotationX: 0,
            duration: 1.2, stagger: { each: 0.04, from: 'start' }, ease: 'back.out(1.4)'
        }, 0);

        var labelEl = document.getElementById('evento-label');
        var metaEl = document.getElementById('evento-meta');
        gsap.set([labelEl, metaEl].filter(Boolean), { opacity: 0, y: 20 });
        tl.to(labelEl, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.8');
        tl.to(metaEl, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.6');

        gsap.set('.evento-body, .evento-back, .evento-cta-wrap', { opacity: 0, y: 20 });
        tl.to('.evento-body, .evento-back, .evento-cta-wrap', { autoAlpha: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out' }, '-=0.4');
    } else {
        titleEl.style.visibility = 'visible';
    }
}

/* ----- INICI SECCIÓ I18N (idiomes) ----- */

const i18n = {
    es: {
        "nav.nosotros": "Nosotros",
        "nav.artistas": "Artistas",
        "nav.agenda": "Agenda",
        "nav.noticias": "Noticias",
        "nav.contacto": "Contacto",
        "footer.tagline": "Descubrimos y promovemos artistas con un talento excepcional.",
        "footer.menu": "Menú",
        "footer.contacto": "Contacto",
        "footer.girona": "Girona",
        "footer.london": "London",
        "footer.copyright": "© 2026 Victoria Taylor · Global Brands Europe, SL",
        "footer.legal.aviso": "Aviso legal",
        "footer.legal.privacidad": "Privacidad",
        "footer.legal.cookies": "Cookies",
        "footer.legal.accesibilidad": "Accesibilidad",
        "footer.developed": "Desarrollado por",
        "contact.title": "Contacto",
        "contact.girona": "Carrer Pic de Peguera, 11 17003 GIRONA",
        "contact.london": "VICTORIA TAYLOR<br>112 Whitechapel High Street E1 7AQ LONDON",
        "contact.subtitle": "Regístrate para mantenerte<br>informado de nuestras<br>actividades",
        "contact.form.name": "Name",
        "contact.form.email": "Email address",
        "contact.form.message": "Leave a message",
        "contact.form.submit": "Submit",
        "contact.form.privacy": 'He leído y acepto la <a href="privacidad.html" target="_blank">política de privacidad</a>. *',
        "contact.form.marketing": "Acepto recibir información sobre las actividades, servicios y productos de GLOBAL BRANDS EUROPE, SL.",
        "contact.form.disclaimer": "Nos pondremos en contacto contigo en breve. No compartimos tus datos con terceros.",
        "nosotros.hero.title": "Victoria Taylor",
        "nosotros.hero.text1": "Victoria Taylor nace como un espacio de encuentro entre creación y apreciación. No somos una galería tradicional. Somos una plataforma curatorial que selecciona, impulsa y posiciona a artistas contemporáneos dentro de un entorno donde su obra pueda ser vista, entendida y valorada. Creemos en el arte como una forma de lenguaje universal, capaz de transmitir identidad, emoción y pensamiento.",
        "nosotros.hero.text2": "Trabajamos con una visión clara: dar valor real al talento artístico a través de una selección cuidada y una presentación impecable.",
        "nosotros.hero.cta1": "Ver Colección",
        "nosotros.hero.cta2": "Ser Artista",
        "nosotros.artists.title1": "Unimos artistas",
        "nosotros.artists.title2": "contemporáneos",
        "nosotros.artists.title3": "con coleccionistas",
        "nosotros.artists.subtitle": "que buscan piezas únicas, auténticas y con valor emocional y artístico",
        "artistas.title1": "Unimos artistas",
        "artistas.title2": "contemporáneos",
        "artistas.title3": "con coleccionistas",
        "artistas.subtitle": "que buscan piezas únicas, auténticas y con valor emocional y artístico",
        "hero.slide2.subtitle": "Talento Único",
        "hero.slide2.title": "Artistas",
        "hero.slide3.subtitle": "Visión Creativa",
        "hero.slide3.title": "Expresión",
        "hero.slide4.subtitle": "Obras Selectas",
        "hero.slide4.title": "Edición Limitada",
        "hero.slide5.subtitle": "Estilo Vogue",
        "hero.slide5.title": "Elegante",
        "hero.slide6.subtitle": "Nueva Colección",
        "hero.slide6.title": "Infinito",
    },
    ca: {
        "nav.nosotros": "Nosaltres",
        "nav.artistas": "Artistes",
        "nav.agenda": "Agenda",
        "nav.noticias": "Notícies",
        "nav.contacto": "Contacte",
        "footer.tagline": "Descobrim i promocionem artistes amb un talent excepcional.",
        "footer.menu": "Menú",
        "footer.contacto": "Contacte",
        "footer.girona": "Girona",
        "footer.london": "Londres",
        "footer.copyright": "© 2026 Victoria Taylor · Global Brands Europe, SL",
        "footer.legal.aviso": "Avís legal",
        "footer.legal.privacidad": "Privacitat",
        "footer.legal.cookies": "Galetes",
        "footer.legal.accesibilidad": "Accessibilitat",
        "footer.developed": "Desenvolupat per",
        "contact.title": "Contacte",
        "contact.girona": "Carrer Pic de Peguera, 11 17003 GIRONA",
        "contact.london": "VICTORIA TAYLOR<br>112 Whitechapel High Street E1 7AQ LONDRES",
        "contact.subtitle": "Registra't per mantenir-te<br>informat de les nostres<br>activitats",
        "contact.form.name": "Nom",
        "contact.form.email": "Correu electrònic",
        "contact.form.message": "Deixa'ns un missatge",
        "contact.form.submit": "Enviar",
        "contact.form.privacy": 'He llegit i accepto la <a href="privacidad.html" target="_blank">política de privacitat</a>. *',
        "contact.form.marketing": "Accepto rebre informació sobre les activitats, serveis i productes de GLOBAL BRANDS EUROPE, SL.",
        "contact.form.disclaimer": "Ens posarem en contacte amb tu aviat. No compartim les teves dades amb tercers.",
        "nosotros.hero.title": "Victoria Taylor",
        "nosotros.hero.text1": "Victoria Taylor neix com un espai de trobada entre creació i apreciació. No som una galeria tradicional. Som una plataforma curatorial que selecciona, impulsa i posiciona a artistes contemporanis dins d'un entorn on la seva obra pugui ser vista, entesa i valorada. Creiem en l'art com una forma de llenguatge universal, capaç de transmetre identitat, emoció i pensament.",
        "nosotros.hero.text2": "Treballem amb una visió clara: donar valor real al talent artístic a través d'una selecció cuidada i una presentació impecable.",
        "nosotros.hero.cta1": "Veure Col·lecció",
        "nosotros.hero.cta2": "Ser Artista",
        "nosotros.artists.title1": "Unim artistes",
        "nosotros.artists.title2": "contemporanis",
        "nosotros.artists.title3": "amb col·leccionistes",
        "nosotros.artists.subtitle": "que busquen peces úniques, autèntiques i amb valor emocional i artístic",
        "artistas.title1": "Unim artistes",
        "artistas.title2": "contemporanis",
        "artistas.title3": "amb col·leccionistes",
        "artistas.subtitle": "que busquen peces úniques, autèntiques i amb valor emocional i artístic",
        "hero.slide2.subtitle": "Talent Únic",
        "hero.slide2.title": "Artistes",
        "hero.slide3.subtitle": "Visió Creativa",
        "hero.slide3.title": "Expressió",
        "hero.slide4.subtitle": "Obres Selectes",
        "hero.slide4.title": "Edició Limitada",
        "hero.slide5.subtitle": "Estil Vogue",
        "hero.slide5.title": "Elegant",
        "hero.slide6.subtitle": "Nova Col·lecció",
        "hero.slide6.title": "Infinit",
    },
    en: {
        "nav.nosotros": "About",
        "nav.artistas": "Artists",
        "nav.agenda": "Events",
        "nav.noticias": "News",
        "nav.contacto": "Contact",
        "footer.tagline": "We discover and promote artists with exceptional talent.",
        "footer.menu": "Menu",
        "footer.contacto": "Contact",
        "footer.girona": "Girona",
        "footer.london": "London",
        "footer.copyright": "© 2026 Victoria Taylor · Global Brands Europe, SL",
        "footer.legal.aviso": "Legal notice",
        "footer.legal.privacidad": "Privacy",
        "footer.legal.cookies": "Cookies",
        "footer.legal.accesibilidad": "Accessibility",
        "footer.developed": "Developed by",
        "contact.title": "Contact",
        "contact.girona": "Carrer Pic de Peguera, 11 17003 GIRONA",
        "contact.london": "VICTORIA TAYLOR<br>112 Whitechapel High Street E1 7AQ LONDON",
        "contact.subtitle": "Register to stay<br>informed about our<br>activities",
        "contact.form.name": "Name",
        "contact.form.email": "Email address",
        "contact.form.message": "Leave a message",
        "contact.form.submit": "Submit",
        "contact.form.privacy": 'I have read and accept the <a href="privacidad.html" target="_blank">privacy policy</a>. *',
        "contact.form.marketing": "I agree to receive information about GLOBAL BRANDS EUROPE, SL activities, services and products.",
        "contact.form.disclaimer": "We will get back to you shortly. We do not share your data with third parties.",
        "nosotros.hero.title": "Victoria Taylor",
        "nosotros.hero.text1": "Victoria Taylor is born as a meeting space between creation and appreciation. We are not a traditional gallery. We are a curatorial platform that selects, promotes and positions contemporary artists within an environment where their work can be seen, understood and valued. We believe in art as a form of universal language, capable of conveying identity, emotion and thought.",
        "nosotros.hero.text2": "We work with a clear vision: to give real value to artistic talent through careful selection and impeccable presentation.",
        "nosotros.hero.cta1": "View Collection",
        "nosotros.hero.cta2": "Become an Artist",
        "nosotros.artists.title1": "We bring contemporary",
        "nosotros.artists.title2": "artists together",
        "nosotros.artists.title3": "with collectors",
        "nosotros.artists.subtitle": "who seek unique, authentic pieces with emotional and artistic value",
        "artistas.title1": "We bring contemporary",
        "artistas.title2": "artists together",
        "artistas.title3": "with collectors",
        "artistas.subtitle": "who seek unique, authentic pieces with emotional and artistic value",
        "hero.slide2.subtitle": "Unique Talent",
        "hero.slide2.title": "Artists",
        "hero.slide3.subtitle": "Creative Vision",
        "hero.slide3.title": "Expression",
        "hero.slide4.subtitle": "Selected Works",
        "hero.slide4.title": "Limited Edition",
        "hero.slide5.subtitle": "Vogue Style",
        "hero.slide5.title": "Elegant",
        "hero.slide6.subtitle": "New Collection",
        "hero.slide6.title": "Infinite",
    }
};

let vtCurrentLang = localStorage.getItem("vt-lang") || "es";

function setVTLang(lang) {
    if (!i18n[lang]) return;
    vtCurrentLang = lang;
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (!i18n[lang] || !i18n[lang][key]) return;
        // Si el nav link ya tiene split-mask (de initNavHover), només canviem el text
        const elSplit = el.querySelector(".split-mask");
        if (elSplit) {
            const orig = el.querySelector(".txt-original");
            const clone = el.querySelector(".txt-clone");
            if (orig && clone) {
                orig.textContent = i18n[lang][key];
                clone.textContent = i18n[lang][key];
                return;
            }
        }
        el.innerHTML = i18n[lang][key];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (i18n[lang] && i18n[lang][key]) {
            el.placeholder = i18n[lang][key];
        }
    });

    document.querySelectorAll(".lang-btn, .mobile-lang-btn").forEach((btn) => {
        btn.classList.toggle("lang-btn--active", btn.getAttribute("data-lang") === lang);
        btn.classList.toggle("mobile-lang-btn--active", btn.getAttribute("data-lang") === lang);
    });

    const currentFlag = document.getElementById("current-flag");
    if (currentFlag) {
        currentFlag.className = `lang-switcher__flag lang-switcher__flag--${lang}`;
    }

    localStorage.setItem("vt-lang", lang);

    // Re-renderitzar pàgina d'artista si és el cas
    if (typeof window.renderArtist === "function") {
        window.renderArtist(lang);
    }
}

document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-lang]");
    if (btn) setVTLang(btn.getAttribute("data-lang"));
});

// Inicialitzem tot quan el DOM estigui llist
document.addEventListener("DOMContentLoaded", () => {
    // Apliquem l'idioma guardat abans d'inicialitzar res
    setVTLang(vtCurrentLang);

    // Ordre crític: primer preparem l'estructura de hover, després animem l'entrada
    initNavHover(); 
    initHeaderAnimations();
    initMobileMenu();

    // Parallax real amb ScrollTrigger (només si existeix la secció)
    if (document.querySelector('.about-parallax')) {
        gsap.to('.about-parallax-bg', {
            yPercent: -35,
            ease: 'none',
            scrollTrigger: {
                trigger: '.about-parallax',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        });
    }

    // About entrance (nosotros.html hero + artists section)
    if (document.querySelector('.about-hero') || document.querySelector('.about-artists')) {
        initAboutEntrance();
    }

    // Noticia entrance (noticia.php hero)
    if (document.querySelector('.noticia-hero') && typeof initNoticiaEntrance === 'function') {
        initNoticiaEntrance();
    }

    // Evento entrance (evento.php hero)
    if (document.querySelector('.evento-hero') && typeof initEventoEntrance === 'function') {
        initEventoEntrance();
    }

    // Footer reveal animation
    if (document.querySelector('.main-footer')) {
        const footerCols = document.querySelectorAll('.footer-grid > div');
        gsap.from(footerCols, {
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: {
                trigger: '.main-footer',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });

        // Bottom bar reveal
        gsap.from('.footer-bottom', {
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: 'power2.out',
            delay: 0.4,
            scrollTrigger: {
                trigger: '.main-footer',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
    }

    // Animació Entrada Contacto
    if (document.querySelector('.contact-page')) {
        document.fonts.ready.then(() => {
            const contactTl = gsap.timeline({ delay: 0.5 });
            
            const title = document.querySelector('.contact-title');
            title.style.visibility = 'visible';
            const splitTitle = new SplitText(title, { type: "chars" });
            
            gsap.set(splitTitle.chars, { opacity: 0, yPercent: -50, scale: 0.5, rotationX: -90, transformOrigin: "center bottom" });
            
            contactTl.to(splitTitle.chars, {
                opacity: 1, 
                yPercent: 0, 
                scale: 1,
                rotationX: 0,
                duration: 1.2, 
                stagger: { each: 0.04, from: "start" }, 
                ease: "back.out(1.4)"
            });
            
            contactTl.from('.contact-details, .contact-socials', {
                opacity: 0, 
                y: 20, 
                duration: 0.8, 
                ease: "power2.out"
            }, "-=0.6");
            
            contactTl.from('.contact-subtitle', {
                opacity: 0,
                y: 20,
                duration: 0.8,
                ease: "power2.out"
            }, "-=0.6");

            contactTl.from('.contact-form-wrapper', {
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: "power2.out"
            }, "-=0.4");
            
            contactTl.from('.clover-image', {
                opacity: 0,
                scale: 0.8,
                rotation: 5,
                duration: 1.2,
                ease: "power3.out"
            }, "-=1");
        });
    }
});