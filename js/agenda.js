/**
 * =============================================================================
 * AGENDA.JS — Listado de agenda (próximos eventos + históricos)
 * =============================================================================
 * Propósito: Carga los eventos desde Strapi (o fallback) y los muestra en un
 * listado con dos pestañas: "Próximos" (upcoming) e "Históricos" (historical).
 *
 * Diferencias con noticias.js:
 *   - Sistema de pestañas para filtrar por tipo de evento
 *   - Cards con formato de fecha visual (día grande + mes abreviado)
 *   - Badge de fecha superpuesto a la imagen
 *   - Enlace a evento.html?id=X en vez de noticia.html
 *
 * Dependencias externas: GSAP, ScrollTrigger, SplitText
 * =============================================================================
 */

// ─── CONFIGURACIÓN ───────────────────────────────────────────────────────────
// Mismo patrón que noticias.js pero apuntando al endpoint de eventos de Strapi.
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_EVENTS_ENDPOINT = `${STRAPI_URL}/api/events?populate=image`;
const AGENDA_JSON_FALLBACK = '../json/agenda.json';

// Nombres de meses en catalán abreviados (3 letras) para el badge visual.
// Se usa en formatMonth() para mostrar "15 jul" en vez de "15 de juliol de 2025".
const MONTHS_CAT = ['gen', 'feb', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'des'];

// state.activeTab controla qué pestaña se muestra. Inicia en 'upcoming'
// porque es lo primero que ve el usuario al cargar la página.
const state = {
    events: [],
    activeTab: 'upcoming',
};

// ─── AUXILIARES ──────────────────────────────────────────────────────────────

/**
 * Extrae el día (DD) de una fecha ISO.
 * Separado de formatMonth() para poder usarlos independientemente
 * en el badge visual: día grande arriba, mes abreviado abajo.
 */
function formatDay(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.getDate().toString().padStart(2, '0');
}

/**
 * Extrae el mes abreviado en catalán de una fecha ISO.
 * Usa MONTHS_CAT en vez de toLocaleDateString porque necesitamos
 * 3 letras ("jul") y no el nombre completo ("juliol").
 */
function formatMonth(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return MONTHS_CAT[d.getMonth()];
}

/**
 * Formatea fecha completa + hora opcional para la meta de la card.
 * Ej: "15 de juliol de 2025 · 19:00"
 * toLocaleDateString('ca-ES') da el formato largo en catalán.
 */
function formatDateFull(dateStr, timeStr) {
    const d = new Date(dateStr + 'T12:00:00');
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    let text = d.toLocaleDateString('ca-ES', options);
    if (timeStr) text += ` · ${timeStr}`;
    return text;
}

// ─── RENDERIZADO ─────────────────────────────────────────────────────────────

/**
 * Renderiza el listado de eventos filtrado por la pestaña activa.
 *
 * Flujo:
 *   1. Cuenta eventos de cada tipo y actualiza contadores en las tabs
 *   2. Activa/desactiva visualmente la pestaña correspondiente
 *   3. Filtra state.events por type === state.activeTab
 *   4. Genera las cards con fecha, imagen, título, meta, descripción y CTA
 *   5. Dispara animateCards()
 *
 * Por qué separado de la carga de datos: permite cambiar de pestaña sin
 * tener que llamar a Strapi de nuevo. Los datos ya están en state.events.
 */
function renderAgenda() {
    const container = document.getElementById('agenda-list');
    const tabUpcoming = document.getElementById('agenda-tab-upcoming');
    const tabHistorical = document.getElementById('agenda-tab-historical');
    const countUpcoming = document.getElementById('agenda-count-upcoming');
    const countHistorical = document.getElementById('agenda-count-historical');

    if (!container) return;

    // Actualizar contadores: (3) (12) al lado de cada tab
    const numUpcoming = state.events.filter(e => e.type === 'upcoming').length;
    const numHistorical = state.events.filter(e => e.type === 'historical').length;
    if (countUpcoming) countUpcoming.textContent = `(${numUpcoming})`;
    if (countHistorical) countHistorical.textContent = `(${numHistorical})`;

    // Activar tab visualmente
    if (tabUpcoming) tabUpcoming.classList.toggle('is-active', state.activeTab === 'upcoming');
    if (tabHistorical) tabHistorical.classList.toggle('is-active', state.activeTab === 'historical');

    // Filtrar según pestaña activa
    const filtered = state.events.filter(e => e.type === state.activeTab);

    // Empty state por pestaña: mensaje diferente según si es upcoming o historical
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="agenda-empty">
                ${state.activeTab === 'upcoming'
                    ? 'No hi ha pròxims events. Torna aviat!'
                    : 'No hi ha events històrics.'}
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map((event, index) => `
        <article class="agenda-card" data-index="${index}">
            <div class="agenda-card-img">
                <img
                    src="${event.image || '../img/slide1.webp'}"
                    alt="${event.title}"
                    loading="${index < 2 ? 'eager' : 'lazy'}"
                    width="400"
                    height="225"
                >
                <!-- Badge de fecha superpuesto: día grande + mes abreviado -->
                <div class="agenda-card-badge">
                    <span class="agenda-card-badge-day">${formatDay(event.date)}</span>
                    <span class="agenda-card-badge-month">${formatMonth(event.date)}</span>
                </div>
            </div>
            <div class="agenda-card-body">
                <span class="agenda-card-type">
                    ${event.type === 'upcoming' ? 'Proper event' : 'Event passat'}
                </span>
                <h3 class="agenda-card-title">${event.title}</h3>
                <div class="agenda-card-meta">
                    <span class="agenda-card-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        ${formatDateFull(event.date, event.time)}
                    </span>
                    ${event.location ? `
                    <span class="agenda-card-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        ${event.location}
                    </span>` : ''}
                </div>
                ${event.description ? `<p class="agenda-card-desc">${event.description}</p>` : ''}
            </div>
            <!-- CTA que enlaza a la página individual del evento -->
            <div class="agenda-card-footer">
                <a href="evento.html?id=${event.id}" class="agenda-card-cta" aria-label="${event.cta_text} — ${event.title}">
                    ${event.cta_text}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </a>
            </div>
        </article>
    `).join('');

    animateCards();
}

// ─── ANIMACIONES GSAP ─────────────────────────────────────────────────────────
// Mismo patrón que noticias.js: SplitText con rotación 3D en el hero +
// stagger scroll-triggered en las cards + parallax en el fondo.

/**
 * Animación del hero con SplitText + staggered chars.
 * Idéntica a initHeroAnimation() de noticias.js — misma firma visual.
 *
 * La consistencia entre páginas (noticias y agenda) es intencionada para
 * mantener una identidad visual homogénea en toda la web.
 */
function initHeroAnimation() {
    const heroTitle = document.querySelector('.agenda-hero-title');
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

    gsap.set('.agenda-hero-label, .agenda-hero-subtitle', { opacity: 0, y: 20 });
    gsap.to('.agenda-hero-label', {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.8
    });
    gsap.to('.agenda-hero-subtitle', {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 1
    });
}

/**
 * Animación de las cards al hacer scroll con fade+slide y stagger.
 *
 * visibility:visible se fuerza antes de la animación porque GSAP
 * autoAlpha:0 puede ocultar elementos permanentemente si el scrollTrigger
 * no se activa (por ejemplo, si la página es muy corta).
 */
function animateCards() {
    const cards = document.querySelectorAll('.agenda-card');
    if (!cards.length) return;

    cards.forEach(card => card.style.visibility = 'visible');

    gsap.from(cards, {
        autoAlpha: 0,
        y: 30,
        duration: 0.7,
        stagger: { each: 0.15, from: 'start' },
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.agenda-list',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
            once: true
        }
    });
}

// ─── PARALLAX ────────────────────────────────────────────────────────────────

/**
 * Efecto parallax en el fondo del hero de agenda.
 * Misma configuración que noticias.js (yPercent:15, scrub:1).
 */
function initParallax() {
    const bg = document.querySelector('.agenda-hero-bg');
    if (!bg) return;

    gsap.to(bg, {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
            trigger: '.agenda-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        }
    });
}

// ─── CARGA DE DATOS ───────────────────────────────────────────────────────────
// Mismo patrón resilient-first: Strapi → fallback JSON → error.
// La diferencia es que los eventos tienen más campos que las noticias:
// time, type, cta_text, cta_url.

/**
 * Carga los eventos desde Strapi con fallback a JSON local.
 *
 * Normalización de campos: Strapi puede devolver los nombres en camelCase
 * (title, date, time) o con inicial mayúscula (Title, Date, Time) según la
 * versión y configuración. El mapeo con fallback (a || b || '') cubre ambos casos.
 */
async function loadAgenda() {
    const container = document.getElementById('agenda-list');
    if (!container) return;

    container.innerHTML = `
        <div class="agenda-loading">
            Carregant events
            <span class="agenda-loading-dot"></span>
            <span class="agenda-loading-dot"></span>
            <span class="agenda-loading-dot"></span>
        </div>
    `;

    try {
        const response = await fetch(STRAPI_EVENTS_ENDPOINT);
        if (!response.ok) throw new Error('Strapi no disponible');

        const body = await response.json();
        const events = Array.isArray(body.data) ? body.data : [];
        state.events = events.map(e => ({
            id: e.id,
            title: e.title || e.Title || '',
            date: e.date || e.Date || '',
            time: e.time || e.Time || '',
            location: e.location || e.Location || '',
            description: e.description || e.Description || '',
            // Normalización de imagen: objeto Strapi vs string directa del JSON
            image: typeof e.image === 'object' && e.image?.url
                ? `${STRAPI_URL}${e.image.url}`
                : typeof e.Image === 'object' && e.Image?.url
                ? `${STRAPI_URL}${e.Image.url}`
                : e.image || e.Image || '',
            // type: 'upcoming' o 'historical' — decide en qué pestaña aparece
            type: e.type || e.Type || 'upcoming',
            cta_url: e.cta_url || e.ctaUrl || e.Cta_url || '#',
            cta_text: e.cta_text || e.ctaText || e.Cta_text || 'Més informació'
        }));
        renderAgenda();

    } catch (error) {
        console.warn('Strapi caigut, provant fallback JSON...', error.message);

        try {
            const fallbackRes = await fetch(AGENDA_JSON_FALLBACK);
            if (!fallbackRes.ok) throw new Error('Fallback no disponible');

            const fallbackData = await fallbackRes.json();
            state.events = Array.isArray(fallbackData) ? fallbackData : [];
            renderAgenda();

        } catch (fallbackError) {
            console.warn(fallbackError.message);
            container.innerHTML = `
                <div class="agenda-empty">
                    No s'han pogut carregar els events.
                </div>
            `;
        }
    }
}

// ─── SISTEMA DE PESTAÑAS ──────────────────────────────────────────────────────
// Las pestañas filtran los eventos por type ('upcoming' / 'historical').
// No recargan datos de Strapi — solo cambian state.activeTab y re-renderizan.

/**
 * Inicializa los event listeners de las pestañas.
 * Cambiar de pestaña solo actualiza state.activeTab y llama a renderAgenda()
 * — no hay llamada a la API, los datos ya están en state.events.
 *
 * El early return (if activeTab === tab) evita re-renderizados innecesarios
 * cuando el usuario hace clic en la pestaña ya activa.
 */
function initTabs() {
    const tabUpcoming = document.getElementById('agenda-tab-upcoming');
    const tabHistorical = document.getElementById('agenda-tab-historical');

    tabUpcoming?.addEventListener('click', () => {
        if (state.activeTab === 'upcoming') return;
        state.activeTab = 'upcoming';
        renderAgenda();
    });

    tabHistorical?.addEventListener('click', () => {
        if (state.activeTab === 'historical') return;
        state.activeTab = 'historical';
        renderAgenda();
    });
}

// ─── BOOT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, SplitText);

    if (!document.querySelector('.agenda-hero')) return;

    initHeroAnimation();
    initParallax();
    initTabs();
    loadAgenda();
});
