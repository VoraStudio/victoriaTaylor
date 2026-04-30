/* ----- INICI SECCIÓ SWIPER + GSAP ----- */

// Variable de control per evitar solapaments d'animacions
let isAnimating = false;

// Inicialitzem Swiper
const swiper = new Swiper(".mySwiper", {
    speed: 1600, 
    loop: true,
    parallax: true,
    mousewheel: false, // Controlat manualment per l'interceptor
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    navigation: {
        nextEl: ".next-btn",
        prevEl: ".prev-btn",
    },
    on: {
        // Animació de benvinguda (entrada inicial de la web)
        init: function() {
            const activeBg = document.querySelector(".swiper-slide-active .slide-bg");
            gsap.fromTo(activeBg, { scale: 1.4 }, { scale: 1, duration: 2.5, ease: "power2.out" });
        },
        // Aquesta part és la "ENTRADA" (exactament com estava abans)
        slideChangeTransitionEnd: function() {
            const activeBg = document.querySelector(".swiper-slide-active .slide-bg");
            const activeContent = document.querySelector(".swiper-slide-active .slide-content");

            // La foto entra des de 0.75 i creix fins a 1
            gsap.fromTo(activeBg, 
                { scale: 0.75 }, 
                { 
                    scale: 1, 
                    duration: 1.2, 
                    ease: "power4.out",
                    onComplete: () => {
                        isAnimating = false; // Alliberem el bloqueig
                    }
                }
            );

            // Apareix el text amb el moviment cap amunt
            gsap.fromTo(activeContent, 
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.4 }
            );
        }
    }
});

// INTERCEPTOR DE LA RODA (SORTIDA)
window.addEventListener('wheel', (e) => {
    if (isAnimating) return;

    if (Math.abs(e.deltaY) > 40) {
        isAnimating = true;

        // Seleccionem tots els fons i continguts per la "SORTIDA"
        const allBgs = document.querySelectorAll(".slide-bg");
        const currentContent = document.querySelector(".swiper-slide-active .slide-content");

        // 1. Efecte de SORTIDA: Totes les imatges s'encullen primer
        gsap.to(allBgs, {
            scale: 0.75,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
                // 2. Un cop totes estan a 0.75, fem el canvi de slide
                if (e.deltaY > 0) {
                    swiper.slideNext();
                } else {
                    swiper.slidePrev();
                }
            }
        });

        // Amaguem el text actiu
        gsap.to(currentContent, {
            opacity: 0,
            y: 30,
            duration: 0.5,
            ease: "power2.inOut"
        });
    }
}, { passive: true });