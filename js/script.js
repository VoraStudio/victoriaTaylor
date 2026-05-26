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
    }
}

// Inicialitzem tot quan el DOM estigui llist
document.addEventListener("DOMContentLoaded", () => {
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
    }
});