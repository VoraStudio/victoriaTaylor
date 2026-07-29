/* ----- INICI ANIMACIÓ I CÀRREGA LLISTAT NOTÍCIES (JS + SSR TABS) ----- */
document.addEventListener("DOMContentLoaded", () => {
  // 1. Animació d'entrada del Hero de Notícies (estil Nosotros)
  const heroTitle = document.querySelector(".news-hero-title");
  if (heroTitle) heroTitle.style.visibility = "visible";
  let heroSplit = null;
  if (heroTitle && typeof vtSplit !== "undefined") {
    heroSplit = vtSplit(heroTitle, { type: "words,chars" });
    if (heroSplit) {
      gsap.set(heroSplit.chars, { opacity: 0, yPercent: -50, scale: 0.5, rotationX: -90, transformOrigin: "center bottom" });
    }
  }

  gsap.set(".news-hero-subtitle", { y: 20 });

  const heroTl = gsap.timeline({});
  if (heroSplit) {
    heroTl.to(
      heroSplit.chars,
      {
        opacity: 1,
        yPercent: 0,
        scale: 1,
        rotationX: 0,
        duration: 1.2,
        stagger: { each: 0.04, from: "start" },
        ease: "back.out(1.4)",
      },
      0,
    );
    heroTl.to(".news-hero-subtitle", { autoAlpha: 0.65, y: 0, duration: 3, ease: "power3.out" }, ">-0.8");
  } else {
    heroTl.to(".news-hero-subtitle", { autoAlpha: 0.65, y: 0, duration: 1, ease: "power3.out" });
  }

  // 2. Control de Pestanyes (Tabs) i Animació de targetes
  const tabLatest = document.getElementById("news-tab-latest");
  const tabHistorical = document.getElementById("news-tab-historical");
  const newsLatestEl = document.getElementById("news-latest");
  const newsHistoricalEl = document.getElementById("news-historical");
  const listContainer = document.getElementById("news-list");

  function switchTab(tab) {
    const isLatest = tab === tabLatest;
    tabLatest.classList.toggle("is-active", isLatest);
    tabLatest.setAttribute("aria-selected", isLatest);
    tabHistorical.classList.toggle("is-active", !isLatest);
    tabHistorical.setAttribute("aria-selected", !isLatest);

    // Ocultem les llistes temporalment
    if (newsLatestEl) newsLatestEl.style.display = "none";
    if (newsHistoricalEl) newsHistoricalEl.style.display = "none";

    // Mostrem el loader de transició
    const loader = document.createElement("div");
    loader.className = "news-loading";
    loader.innerHTML = `
      Carregant notícies
      <span class="news-loading-dot"></span>
      <span class="news-loading-dot"></span>
      <span class="news-loading-dot"></span>
    `;
    if (listContainer) listContainer.appendChild(loader);

    setTimeout(() => {
      // Eliminar loader
      loader.remove();

      // Mostrar el contingut corresponent
      const targetEl = isLatest ? newsLatestEl : newsHistoricalEl;
      if (targetEl) {
        targetEl.style.display = "";

        // Animació d'entrada amb GSAP per a les targetes visibles
        const cards = targetEl.querySelectorAll(".news-card");
        if (cards.length && typeof gsap !== "undefined") {
          gsap.fromTo(
            cards,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 1.5,
              ease: "power3.inOut",
              stagger: 0.35,
              scrollTrigger: {
                trigger: targetEl,
                start: "top 95%",
                toggleActions: "play none none reverse",
              },
            },
          );
        }
      }
    }, 400);
  }

  if (tabLatest) {
    tabLatest.addEventListener("click", () => switchTab(tabLatest));
  }
  if (tabHistorical) {
    tabHistorical.addEventListener("click", () => switchTab(tabHistorical));
  }

  // Inicialització inicial
  if (tabLatest) {
    switchTab(tabLatest);
  }
});
