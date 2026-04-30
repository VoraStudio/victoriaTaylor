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
            gsap.fromTo(activeBg, { scale: 1.4 }, { scale: 1, duration: 2.5, ease: "power2.out" });
        },
        slideChangeTransitionEnd: function() {
            //.swiper-slide-active clase automatica del Swiper
            const activeBg = document.querySelector(".swiper-slide-active .slide-bg");
            const activeContent = document.querySelector(".swiper-slide-active .slide-content");

            // Animació de zoom in
            gsap.fromTo(activeBg, { scale: 0.75 }, { scale: 1, duration: 1.2, ease: "power4.out", onComplete: () => { isAnimating = false; } });
            
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


// FUNCIÓ DE HOVER PREMIUM AMB SPLITTEXT (MOLT MÉS SIMPLIFICADA)
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