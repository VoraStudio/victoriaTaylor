/**
 * =============================================================================
 * NOTICIAS.JS — Listado de noticias (página principal)
 * =============================================================================
 * Propósito: Carga las noticias desde Strapi (o fallback JSON local) y las
 * renderiza en un grid de cards con animaciones GSAP Academy style.
 *
 * Flujo general:
 *   Boot → initHeroAnimation() + initParallax() + loadNews()
 *   loadNews → fetch Strapi → renderNews() → animateCards()
 *            → si falla → fetch JSON fallback → renderNews()
 *            → si falla todo → mensaje de error
 *
 * Dependencias externas: GSAP, ScrollTrigger, SplitText
 * =============================================================================
 */

// ─── CONFIGURACIÓN ───────────────────────────────────────────────────────────
// Separamos la URL base de Strapi para poder cambiarla al desplegar a producción
// sin tener que modificar cada endpoint. El sort por fecha descendente asegura
// que la noticia más reciente sea la primera. populate=image es necesario porque
// Strapi no incluye relaciones por defecto (solo devuelve el ID).
const STRAPI_URL = "http://localhost:1337";
const STRAPI_NEWS_ENDPOINT = `${STRAPI_URL}/api/articles?sort[0]=date:desc&populate=image`;
const NEWS_JSON_FALLBACK = "../json/noticias.json";

// state mantiene los datos ya cargados para no tener que llamar a Strapi
// cada vez que se re-renderiza (por ejemplo si añadiésemos filtros).
const state = {
  articles: [],
};

// ─── AUXILIARES ──────────────────────────────────────────────────────────────

/**
 * Convierte una fecha ISO (YYYY-MM-DD) a formato DD/MM/YYYY.
 * Añadimos T12:00:00 para evitar que el constructor de Date interprete la fecha
 * en UTC y la desplace según la zona horaria del usuario, lo que podría cambiar
 * el día mostrado.
 */
function formatDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// ─── RENDERIZADO ─────────────────────────────────────────────────────────────

/**
 * Renderiza el grid de cards de noticias a partir de state.articles.
 *
 * Por qué separado de loadNews(): permite re-renderizar sin llamar a la API,
 * útil si queremos añadir filtros o búsqueda más adelante sin reescribir nada.
 */
function renderNews() {
  const container = document.getElementById("news-grid");
  if (!container) return;

  // Empty state: si el array está vacío mostramos un mensaje amigable
  // en vez de un grid vacío o error.
  if (state.articles.length === 0) {
    container.innerHTML = `
      <div class="news-empty">
        No hi ha notícies disponibles.
      </div>
    `;
    return;
  }

  // Mapeo de categorías internas (inglés/valores Strapi) a labels visibles en catalán.
  // Strapi guarda los valores en minúscula; nosotros mostramos el nombre formateado.
  const categoryNames = {
    exposicion: "Exposición",
    entrevista: "Entrevista",
    colaboracion: "Colaboración",
    reconocimiento: "Reconocimiento",
    feria: "Feria",
    otro: "",
  };

  container.innerHTML = state.articles
    .map((article, index) => {
      const catLabel = categoryNames[article.category] || "";
      const imgSrc = article.image || "";
      return `
    <a href="noticia.html?id=${article.id}" class="news-card" aria-label="${article.title}">
      <div class="news-card-img">
        ${
          imgSrc
            ? // Las 3 primeras imágenes cargan con eager (prioridad visual arriba del fold),
              // el resto con lazy para no bloquear la carga inicial de la página.
              `<img src="${imgSrc}" alt="${article.title}" loading="${index < 3 ? "eager" : "lazy"}" width="400" height="250">`
            : // Placeholder SVG cuando no hay imagen: evita que la card se rompa visualmente.
              `<div class="news-card-img-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`
        }
        ${catLabel ? `<span class="news-card-cat">${catLabel}</span>` : ""}
      </div>
      <div class="news-card-body">
        <span class="news-card-date">${formatDate(article.date)}</span>
        <h3 class="news-card-title">${article.title}</h3>
      </div>
    </a>`;
    })
    .join("");

  // Las animaciones se disparan después de renderizar porque necesitan
  // que los elementos existan en el DOM.
  animateCards();
}

// ─── ANIMACIONES GSAP ─────────────────────────────────────────────────────────
// Todas las animaciones siguen el estilo GSAP Academy: SplitText con rotación 3D
// en los títulos, staggers secuenciales, y scroll-triggered reveals.
// Se separan del renderizado para que puedan reejecutarse si es necesario
// sin tener que regenerar el HTML.

/**
 * Animación de entrada del hero de la página (título + label + subtítulo).
 *
 * El título usa SplitText para animar cada carácter individualmente con una
 * rotación 3D (rotationX: -90 → 0) mientras cae en su sitio. Este efecto es
 * un sello visual de GSAP Academy y da una sensación de calidad editorial.
 *
 * Por qué animamos caracteres y no palabras completas: da un acabado más
 * vistoso y premium, adecuado para una web de artista/arquitectura.
 *
 * Los delays escalonados (0.3s título, 0.8s label, 1s subtítulo) aseguran
 * que el ojo del usuario siga una jerarquía visual: primero lo más importante.
 */
function initHeroAnimation() {
  const heroTitle = document.querySelector(".news-hero-title");
  if (!heroTitle) return;

  // SplitText oculta el texto original hasta que lo animamos, así que
  // forzamos visibilidad para evitar un flash de contenido invisible.
  heroTitle.style.visibility = "visible";

  const split = new SplitText(heroTitle, { type: "words,chars" });

  // Estado inicial: cada carácter empieza invisible, desplazado arriba y rotado.
  gsap.set(split.chars, {
    opacity: 0,
    yPercent: -50,
    rotationX: -90,
    transformOrigin: "center bottom",
  });

  // Animación de entrada: los caracteres "caen" a su sitio con stagger.
  // stagger:0.04 entre cada carácter crea un efecto de onda.
  gsap.to(split.chars, {
    opacity: 1,
    yPercent: 0,
    rotationX: 0,
    duration: 1,
    stagger: { each: 0.04, from: "start" },
    ease: "power3.out",
    delay: 0.3,
  });

  gsap.set(".news-hero-label, .news-hero-subtitle", { opacity: 0, y: 20 });
  gsap.to(".news-hero-label", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "power3.out",
    delay: 0.8,
  });
  gsap.to(".news-hero-subtitle", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "power3.out",
    delay: 1,
  });
}

/**
 * Animación de las cards al hacer scroll.
 *
 * Aparecen con fade-in + slide-up, una tras otra (stagger 0.1s).
 * El scrollTrigger con once:true evita que se repita la animación al hacer
 * scroll hacia arriba y hacia abajo — solo se reproduce una vez.
 */
function animateCards() {
  const cards = document.querySelectorAll(".news-card");
  if (!cards.length) return;

  gsap.from(cards, {
    autoAlpha: 0,
    y: 30,
    duration: 0.7,
    stagger: { each: 0.1, from: "start" },
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".news-grid",
      start: "top 80%",
      toggleActions: "play none none reverse",
      once: true,
    },
  });
}

// ─── PARALLAX ────────────────────────────────────────────────────────────────

/**
 * Efecto parallax en la imagen de fondo del hero.
 *
 * yPercent:15 mueve la imagen un 15% más lento que el scroll, creando
 * profundidad. Con scrub:1 el movimiento sigue suavemente al scroll en vez
 * de estar atado a una posición fija.
 *
 * ease:'none' es importante aquí: el parallax debe ser lineal para que
 * no haya aceleraciones que rompan la ilusión de profundidad.
 */
function initParallax() {
  const bg = document.querySelector(".news-hero-bg");
  if (!bg) return;

  gsap.to(bg, {
    yPercent: 15,
    ease: "none",
    scrollTrigger: {
      trigger: ".news-hero",
      start: "top top",
      end: "bottom top",
      scrub: 1,
    },
  });
}

// ─── CARGA DE DATOS ───────────────────────────────────────────────────────────
// Estrategia "resilient first": intenta Strapi, si falla usa JSON local.
// Esto permite que la web funcione incluso si el CMS está caído o en desarrollo
// local sin Strapi arrancado.

/**
 * Carga las noticias desde Strapi con fallback a JSON local.
 *
 * Flujo:
 *   1. Muestra estado de carga (dots animados) para feedback visual inmediato.
 *   2. fetch() a Strapi → si OK, mapea campos y renderiza.
 *   3. Si Strapi falla (catch) → intenta fetch al JSON de respaldo.
 *   4. Si el fallback también falla → muestra mensaje de error.
 *
 * Por qué mapeamos campos manualmente:
 *   - Strapi puede devolver camelCase (title) o Title (depende de la versión).
 *   - El fallback JSON puede tener estructura distinta.
 *   - El mapeo unifica ambos orígenes en un formato común.
 *
 * Por qué usamos filters[id][$eq]=X en vez de /api/articles/X:
 *   - Strapi v5 usa documentId como identificador único en la URL directa,
 *     no el id numérico tradicional. Con filters podemos seguir usando el id.
 */
async function loadNews() {
  const container = document.getElementById("news-grid");
  if (!container) return;

  // Feedback visual inmediato: el usuario sabe que algo está pasando.
  container.innerHTML = `
    <div class="news-loading">
      Carregant notícies
      <span class="news-loading-dot"></span>
      <span class="news-loading-dot"></span>
      <span class="news-loading-dot"></span>
    </div>
  `;

  try {
    const response = await fetch(STRAPI_NEWS_ENDPOINT);
    if (!response.ok) throw new Error("Strapi no disponible");

    const body = await response.json();
    const articles = Array.isArray(body.data) ? body.data : [];
    // Normalización de campos: cubre diferencias entre Strapi y JSON fallback
    state.articles = articles.map((a) => ({
      id: a.id,
      title: a.title || a.Title || "",
      date: a.date || a.Date || "",
      // La imagen puede venir como objeto { url: '/uploads/...' } (Strapi)
      // o como string directa (JSON). En Strapi hay que prefijar con STRAPI_URL.
      image:
        typeof a.image === "object" && a.image?.url
          ? `${STRAPI_URL}${a.image.url}`
          : typeof a.Image === "object" && a.Image?.url
            ? `${STRAPI_URL}${a.Image.url}`
            : a.image || a.Image || "",
      description: a.description || a.Description || "",
      location: a.location || a.Location || "",
      category: a.category || a.Category || "",
      cta_label: a.cta_label || a.Cta_label || "Leer noticia",
      cta_url: a.cta_url || a.ctaUrl || a.Cta_url || "#",
    }));
    renderNews();
  } catch (error) {
    // Strapi no disponible (servidor caído, desarrollo sin Strapi, etc.)
    console.warn("Strapi caigut, provant fallback...", error.message);

    try {
      const fallbackRes = await fetch(NEWS_JSON_FALLBACK);
      if (!fallbackRes.ok) throw new Error("Fallback no disponible");

      const fallbackData = await fallbackRes.json();
      state.articles = Array.isArray(fallbackData) ? fallbackData : [];
      renderNews();
    } catch (fallbackError) {
      console.warn(fallbackError.message);
      container.innerHTML = `
        <div class="news-empty">
          No s'han pogut carregar les notícies.
        </div>
      `;
    }
  }
}

// ─── BOOT ─────────────────────────────────────────────────────────────────────
// Punto de entrada: registra los plugins de GSAP, comprueba que estamos en la
// página correcta, y dispara animaciones + carga de datos en paralelo.

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // Safety check: si no hay hero, esta página no necesita noticias.js
  // (útil si el script se carga en páginas que no lo necesitan).
  if (!document.querySelector(".news-hero")) return;

  // Las animaciones del hero se disparan inmediatamente (no dependen de datos).
  // loadNews() se ejecuta en paralelo y cuando termina dispara animateCards().
  initHeroAnimation();
  initParallax();
  loadNews();
});
