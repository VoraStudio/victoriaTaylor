/* ----- INICI CONFIGURACIÓ NOTÍCIES ----- */

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_NEWS_ENDPOINT = `${STRAPI_URL}/api/articles?sort[0]=date:desc`;
const NEWS_JSON_FALLBACK = '../json/noticias.json';

const state = {
  articles: [],
};

/* ----- INICI FUNCIONS AUXILIARS ----- */

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/* ----- INICI RENDERITZAT ----- */

function renderNews() {
  const container = document.getElementById('news-list');
  if (!container) return;

  if (state.articles.length === 0) {
    container.innerHTML = `
      <div class="news-empty">
        No hi ha notícies disponibles.
      </div>
    `;
    return;
  }

  container.innerHTML = state.articles.map((article) => `
    <a href="${article.cta_url}" class="news-card" aria-label="${article.title}">
      <time class="news-card-date" datetime="${article.date}">${formatDate(article.date)}</time>
      <h3 class="news-card-title">${article.title}</h3>
    </a>
  `).join('');

  animateCards();
}

/* ----- INICI ANIMACIONS GSAP ----- */

function initHeroAnimation() {
  const heroTitle = document.querySelector('.news-hero-title');
  if (!heroTitle) return;

  const split = new SplitText(heroTitle, { type: 'words,chars' });
  heroTitle.style.visibility = 'visible';

  gsap.set(split.chars, {
    opacity: 0,
    yPercent: -50,
    rotationX: -90,
    transformOrigin: 'center bottom'
  });

  gsap.to(split.chars, {
    opacity: 1,
    yPercent: 0,
    rotationX: 0,
    duration: 1,
    stagger: { each: 0.04, from: 'start' },
    ease: 'power3.out',
    delay: 0.3
  });

  gsap.set('.news-hero-label, .news-hero-subtitle', { opacity: 0, y: 20 });
  gsap.to('.news-hero-label', {
    opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.8
  });
  gsap.to('.news-hero-subtitle', {
    opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 1
  });
}

function animateCards() {
  const cards = document.querySelectorAll('.news-card');
  if (!cards.length) return;

  gsap.from(cards, {
    autoAlpha: 0,
    y: 20,
    duration: 0.6,
    stagger: { each: 0.08, from: 'start' },
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.news-list',
      start: 'top 80%',
      toggleActions: 'play none none reverse',
      once: true
    }
  });
}

/* ----- INICI PARALLAX ----- */

function initParallax() {
  const bg = document.querySelector('.news-hero-bg');
  if (!bg) return;

  gsap.to(bg, {
    yPercent: 15,
    ease: 'none',
    scrollTrigger: {
      trigger: '.news-hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1
    }
  });
}

/* ----- INICI CARREGAR DADES ----- */

async function loadNews() {
  const container = document.getElementById('news-list');
  if (!container) return;

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
    if (!response.ok) throw new Error('Strapi no disponible');

    const body = await response.json();
    const articles = Array.isArray(body.data) ? body.data : [];
    state.articles = articles.map(a => ({
      id: a.id,
      title: a.title || a.Title || '',
      date: a.date || a.Date || '',
      cta_url: a.cta_url || a.ctaUrl || a.Cta_url || '#',
      cta_text: a.cta_text || a.ctaText || a.Cta_text || 'Llegir més',
    }));
    renderNews();

  } catch (error) {
    console.warn('Strapi caigut, provant fallback...', error.message);

    try {
      const fallbackRes = await fetch(NEWS_JSON_FALLBACK);
      if (!fallbackRes.ok) throw new Error('Fallback no disponible');

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

/* ----- INICI BOOT ----- */

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  if (!document.querySelector('.news-hero')) return;

  initHeroAnimation();
  initParallax();
  loadNews();
});
