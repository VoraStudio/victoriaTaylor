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

// Inicialitzem Swiper
const swiper = new Swiper(".mySwiper", {
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
});

// INTERCEPTOR DE LA RODA
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

// Inicialitzem l'efecte als botons PREV i NEXT
hoverNextPrev('.nav-arrow');

// Inicialitzem tot quan el DOM estigui llist
document.addEventListener("DOMContentLoaded", () => {
    // Ordre crític: primer preparem l'estructura de hover, després animem l'entrada
    initNavHover(); 
    initHeaderAnimations();
    initMobileMenu();
});