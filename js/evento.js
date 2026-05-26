/**
 * =============================================================================
 * EVENTO.JS — Página individual de evento
 * =============================================================================
 * Propósito: Estructura casi idéntica a noticia.js pero adaptada a eventos.
 * Carga un evento individual desde Strapi vía ?id=X y renderiza hero +
 * contenido + CTA.
 *
 * Diferencias clave con noticia.js:
 *   - Label del hero fijo ("Event") en vez de categoría variable
 *   - Meta incluye fecha + hora + ubicación (tres campos en vez de dos)
 *   - Botón CTA al final (enlace externo para "Reservar plaça", etc.)
 *   - Endpoint Strapi: /api/events en vez de /api/articles
 *   - Fallback JSON: json/agenda.json en vez de json/noticias.json
 *
 * Dependencias externas: GSAP, ScrollTrigger, SplitText, Lenis
 * =============================================================================
 */

// ─── CONFIGURACIÓN ───────────────────────────────────────────────────────────
// Misma URL base que agenda.js. El fallback es el mismo JSON que usa agenda.js
// para mantener consistencia entre el listado y la página individual.
const STRAPI_URL = 'http://localhost:1337';
const AGENDA_JSON_FALLBACK = '../json/agenda.json';

/**
 * Lee un parámetro de la query string (misma función que en noticia.js).
 * Ej: evento.html?id=3 → devuelve "3"
 */
function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// ─── RENDERIZADO DE RICH TEXT (Strapi v5) ────────────────────────────────────
// Mismas funciones renderBlocks(), renderInline(), escapeHtml() que en noticia.js.
// Se duplican (no se importan) porque el proyecto usa JS vanilla sin módulos.
//
// renderBlocks: convierte bloques estructurados de Strapi v5 a HTML
// renderInline: aplica formato inline (bold, italic, link) al texto de cada bloque
// escapeHtml: escapa caracteres HTML para bloques de código

function renderBlocks(blocks) {
    if (!blocks || !Array.isArray(blocks)) return '';
    let html = '';
    for (const block of blocks) {
        switch (block.type) {
            case 'paragraph':
                html += `<p>${renderInline(block.children)}</p>`;
                break;
            case 'heading':
                html += `<h${block.level}>${renderInline(block.children)}</h${block.level}>`;
                break;
            case 'list':
                const tag = block.format === 'ordered' ? 'ol' : 'ul';
                html += `<${tag}>`;
                for (const item of block.children) {
                    if (item.type === 'list-item') {
                        html += `<li>${renderInline(item.children)}</li>`;
                    }
                }
                html += `</${tag}>`;
                break;
            case 'quote':
                html += `<blockquote>${renderInline(block.children)}</blockquote>`;
                break;
            case 'code':
                html += `<pre><code>${escapeHtml(block.children.map(c => c.text || '').join(''))}</code></pre>`;
                break;
            case 'image':
                if (block.image?.url) {
                    html += `<img src="${STRAPI_URL}${block.image.url}" alt="${block.image.alternativeText || ''}" loading="lazy" width="750" height="auto">`;
                }
                break;
        }
    }
    return html;
}

function renderInline(children) {
    if (!children || !Array.isArray(children)) return '';
    return children.map(child => {
        let text = child.text || '';
        if (child.bold) text = `<strong>${text}</strong>`;
        if (child.italic) text = `<em>${text}</em>`;
        if (child.underline) text = `<u>${text}</u>`;
        if (child.strikethrough) text = `<s>${text}</s>`;
        if (child.code) text = `<code>${text}</code>`;
        if (child.link) text = `<a href="${child.link}">${text}</a>`;
        return text;
    }).join('');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ─── RENDERIZADO ─────────────────────────────────────────────────────────────

/**
 * Rellena el hero del evento con los datos.
 *
 * A diferencia de noticia.js:
 *   - No hay categoría variable — el label del hero es fijo ("Event")
 *   - La meta incluye fecha + hora + ubicación (tres campos)
 *   - Los separadores se calculan dinámicamente: si solo hay fecha + ubicación
 *     (sin hora), solo se muestra un separador entre ellos.
 *
 * El cálculo de visibleCount para los separadores evita que aparezcan
 * separadores colgantes como " |  | " cuando faltan campos.
 */
function renderHero(event) {
    const imgUrl = event.image || '../img/slide1.webp';
    const heroBg = document.getElementById('evento-hero-bg');
    if (heroBg) heroBg.style.backgroundImage = `url('${imgUrl}')`;

    document.title = `Victoria Taylor | ${event.title}`;

    const titleEl = document.getElementById('evento-title');
    if (titleEl) titleEl.textContent = event.title;

    // Fecha formateada en catalán
    const dateEl = document.getElementById('evento-date');
    if (dateEl) {
        const d = new Date(event.date + 'T12:00:00');
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = d.toLocaleDateString('ca-ES', options);
    }

    // Hora — se oculta si no está definida
    const timeEl = document.getElementById('evento-time');
    if (timeEl) {
        if (event.time) {
            timeEl.textContent = event.time;
            timeEl.style.display = 'inline';
        } else {
            timeEl.style.display = 'none';
        }
    }

    // Ubicación — se oculta si no está definida
    const locationEl = document.getElementById('evento-location');
    if (locationEl) {
        if (event.location) {
            locationEl.textContent = event.location;
            locationEl.style.display = 'inline';
        } else {
            locationEl.style.display = 'none';
        }
    }

    // Separadores de meta: tantos como campos visibles haya.
    // Si hay 2 campos visibles (ej: fecha + hora), mostramos 1 separador.
    // Si hay 3 campos visibles, mostramos 2 separadores.
    const metaItems = [!!event.time, !!event.location];
    const visibleCount = metaItems.filter(Boolean).length;
    const seps = document.querySelectorAll('.evento-meta-sep');
    seps.forEach((el, i) => {
        el.style.display = i < visibleCount ? 'inline' : 'none';
    });
}

/**
 * Renderiza el contenido del evento + botón CTA.
 *
 * El contenido sigue el mismo patrón que noticia.js:
 * - description como párrafo destacado
 * - content como string HTML (fallback) o bloques Strapi (renderBlocks)
 *
 * El CTA es específico de eventos:
 * - Si cta_url es "#" (valor por defecto en Strapi cuando no hay enlace),
 *   se oculta el botón completamente.
 * - Si hay URL, se muestra el texto personalizado (cta_text).
 */
function renderContent(event) {
    const bodyEl = document.getElementById('evento-body');
    if (!bodyEl) return;

    let html = '';

    if (event.description) {
        html += `<p class="evento-desc">${event.description}</p>`;
    }

    if (event.content) {
        if (typeof event.content === 'string') {
            html += event.content;
        } else {
            html += renderBlocks(event.content);
        }
    }

    bodyEl.innerHTML = html;

    // CTA: botón de acción del evento ("Reservar plaça", "Més informació", etc.)
    const ctaLink = document.getElementById('evento-cta-link');
    if (ctaLink && event.cta_url && event.cta_url !== '#') {
        ctaLink.textContent = event.cta_text || 'Més informació';
        ctaLink.href = event.cta_url;
    } else if (ctaLink) {
        // Si cta_url es '#' (sin enlace), ocultamos el botón
        ctaLink.parentElement.style.display = 'none';
    }
}

// ─── ANIMACIONES GSAP ─────────────────────────────────────────────────────────
// Mismas animaciones que noticia.js: Lenis smooth scroll + timeline hero con
// SplitText + scroll-triggered content + parallax. La consistencia entre
// páginas individuales asegura una experiencia de lectura homogénea.

/**
 * Inicializa Lenis para smooth scroll.
 * Misma configuración que noticia.js — la experiencia de lectura debe ser
 * idéntica tanto en artículos como en eventos.
 */
function initLenis() {
    if (typeof Lenis === 'undefined') return;
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
}

/**
 * Timeline de entrada del hero del evento.
 * Misma coreografía que noticia.js:
 *   0.0 — Fondo: scale reveal + fade in
 *   0.0 — Overlay: fade in
 *   0.4 — Label "Event": slide down
 *   0.5 — Título: SplitText con rotación 3D
 *   0.9 — Meta (fecha · hora · ubicación): slide up
 */
function initHeroAnimation() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Hero bg: scale reveal cinematográfico
    tl.fromTo('#evento-hero-bg', {
        scale: 1.3,
        opacity: 0,
    }, {
        scale: 1,
        opacity: 1,
        duration: 1.6,
        ease: 'power2.out',
    }, 0);

    // Overlay: gradiente oscuro para legibilidad del texto
    tl.fromTo('.evento-hero-overlay', {
        opacity: 0,
    }, {
        opacity: 1,
        duration: 1.2,
    }, 0);

    // Label "Event"
    tl.from('#evento-label', {
        y: -20,
        opacity: 0,
        duration: 0.8,
    }, 0.4);

    // Título con SplitText: cada carácter con rotación 3D
    const titleEl = document.getElementById('evento-title');
    if (titleEl && typeof SplitText !== 'undefined') {
        titleEl.style.visibility = 'visible';
        const split = new SplitText(titleEl, { type: 'words,chars' });
        gsap.set(split.chars, {
            opacity: 0,
            yPercent: -60,
            rotationX: -90,
            transformOrigin: 'center bottom',
        });
        tl.to(split.chars, {
            opacity: 1,
            yPercent: 0,
            rotationX: 0,
            duration: 1,
            stagger: { each: 0.035, from: 'start' },
            ease: 'power3.out',
        }, 0.5);
    }

    // Meta: fecha · hora · ubicación
    tl.from('#evento-meta', {
        y: 30,
        opacity: 0,
        duration: 0.8,
    }, 0.9);
}

/**
 * Animaciones scroll-triggered del contenido:
 *   - Botón "Tornar"
 *   - Párrafos del cuerpo con stagger
 *   - CTA final (específico de eventos)
 */
function initContentAnimation() {
    // Botón de volver atrás
    gsap.from('#evento-back', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '#evento-back',
            start: 'top 90%',
            toggleActions: 'play none none reverse',
            once: true,
        },
    });

    // Párrafos, titulares, citas, listas con stagger
    const paragraphs = document.querySelectorAll('.evento-body > p, .evento-body > h2, .evento-body > h3, .evento-body > blockquote, .evento-body > ul, .evento-body > ol');
    if (paragraphs.length) {
        gsap.from(paragraphs, {
            y: 40,
            opacity: 0,
            duration: 0.7,
            stagger: { each: 0.12, from: 'start' },
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.evento-body',
                start: 'top 85%',
                toggleActions: 'play none none reverse',
                once: true,
            },
        });
    }

    // CTA del evento — aparece al final del contenido
    gsap.from('#evento-cta-wrap', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '#evento-cta-wrap',
            start: 'top 90%',
            toggleActions: 'play none none reverse',
            once: true,
        },
    });
}

/**
 * Efecto parallax en el fondo del hero.
 * Misma configuración que noticia.js (yPercent:12, scrub:1.5).
 */
function initParallax() {
    const heroBg = document.getElementById('evento-hero-bg');
    if (!heroBg) return;

    gsap.to(heroBg, {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
            trigger: '#evento-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
        },
    });
}

// ─── CARGA DE DATOS ───────────────────────────────────────────────────────────
// Mismo patrón resilient-first: Strapi → fallback JSON → error.

/**
 * Carga un evento individual desde Strapi (o fallback).
 *
 * Misma lógica que loadArticle() en noticia.js pero con campos adicionales
 * (time, cta_text, cta_url) y usando el endpoint de eventos de Strapi.
 *
 * El CTA es específico de eventos: los eventos pueden tener un enlace externo
 * (por ejemplo, a una plataforma de venta de entradas), mientras que las
 * noticias no tienen esta funcionalidad.
 */
async function loadEvent() {
    const id = getUrlParam('id');
    if (!id) {
        document.getElementById('evento-body').innerHTML = '<p>Event no trobat.</p>';
        return;
    }

    try {
        const res = await fetch(`${STRAPI_URL}/api/events?filters[id][$eq]=${id}&populate=image`);
        if (!res.ok) throw new Error('Strapi no disponible');

        const body = await res.json();
        const e = Array.isArray(body.data) && body.data.length > 0 ? body.data[0] : null;
        if (!e) throw new Error('Event no trobat');

        const event = {
            id: e.id,
            title: e.title || e.Title || '',
            date: e.date || e.Date || '',
            time: e.time || e.Time || '',
            location: e.location || e.Location || '',
            image: typeof e.image === 'object' && e.image?.url
                ? `${STRAPI_URL}${e.image.url}`
                : typeof e.Image === 'object' && e.Image?.url
                ? `${STRAPI_URL}${e.Image.url}`
                : e.image || e.Image || '',
            description: e.description || e.Description || '',
            content: e.content || '',
            cta_text: e.cta_text || e.Cta_text || 'Més informació',
            cta_url: e.cta_url || e.ctaUrl || e.Cta_url || '#',
        };

        renderHero(event);
        renderContent(event);

        initLenis();
        initHeroAnimation();
        initContentAnimation();
        initParallax();

    } catch (error) {
        console.warn('Strapi caigut, provant fallback...', error.message);

        try {
            const fallbackRes = await fetch(AGENDA_JSON_FALLBACK);
            if (!fallbackRes.ok) throw new Error('Fallback no disponible');

            const fallbackData = await fallbackRes.json();
            const event = fallbackData.find(e => String(e.id) === id);

            if (!event) {
                document.getElementById('evento-body').innerHTML = '<p>Event no trobat.</p>';
                return;
            }

            renderHero(event);
            renderContent(event);

            initLenis();
            initHeroAnimation();
            initContentAnimation();
            initParallax();

        } catch (fallbackError) {
            console.warn(fallbackError.message);
            document.getElementById('evento-body').innerHTML = '<p>No s\'ha pogut carregar l\'event.</p>';
        }
    }
}

// ─── BOOT ─────────────────────────────────────────────────────────────────────
// Punto de entrada: registra plugins y carga el evento.

document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    loadEvent();
});
