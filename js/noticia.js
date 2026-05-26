/**
 * =============================================================================
 * NOTICIA.JS — Página individual de noticia
 * =============================================================================
 * Propósito: Carga una noticia individual desde Strapi vía ?id=X y renderiza
 * el hero a pantalla completa + el cuerpo del contenido con animaciones.
 *
 * Diferencias clave con noticias.js:
 *   - No es un listado, es una página de detalle.
 *   - Hero fullscreen con imagen de fondo en vez de grid de cards.
 *   - Renderiza rich text de Strapi (bloques → HTML).
 *   - Añade Lenis smooth scroll para la experiencia de lectura.
 *
 * Dependencias externas: GSAP, ScrollTrigger, SplitText, Lenis
 * =============================================================================
 */

// ─── CONFIGURACIÓN ───────────────────────────────────────────────────────────
// Misma URL base que el listado. El fallback es el mismo JSON para mantener
// consistencia: si Strapi falla, cargamos el artículo desde el mismo archivo
// que usa noticias.js.
const STRAPI_URL = 'http://localhost:1337';
const NEWS_JSON_FALLBACK = '../json/noticias.json';

/**
 * Lee un parámetro de la query string de la URL actual.
 * Ej: noticia.html?id=9 → devuelve "9"
 *
 * Por qué no usar window.location.search directamente: este helper encapsula
 * el parsing y es reutilizable en evento.js (misma necesidad).
 */
function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// ─── RENDERIZADO DE RICH TEXT (Strapi v5) ────────────────────────────────────
// Strapi v5 devuelve el contenido rich text como bloques estructurados (no HTML).
// Ejemplo:
//   [{ type: "paragraph", children: [{ text: "Hola", bold: true }] }]
// Necesitamos convertirlos manualmente a HTML.

/**
 * Convierte un array de bloques de Strapi v5 a HTML.
 *
 * Cada bloque tiene un type (paragraph, heading, list, quote, code, image)
 * y un array children con el texto inline y su formato.
 *
 * Por qué separado de renderInline(): la estructura es jerárquica — los bloques
 * contienen hijos inline. Separar permite reutilizar renderInline() para todos
 * los tipos de bloque sin duplicar la lógica de negritas/cursivas/enlaces.
 */
function renderBlocks(blocks) {
    if (!blocks || !Array.isArray(blocks)) return '';
    let html = '';
    for (const block of blocks) {
        switch (block.type) {
            case 'paragraph':
                html += `<p>${renderInline(block.children)}</p>`;
                break;
            case 'heading':
                // block.level indica si es h1, h2, h3, etc.
                html += `<h${block.level}>${renderInline(block.children)}</h${block.level}>`;
                break;
            case 'list':
                // block.format: 'ordered' → <ol>, cualquier otro → <ul>
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
                // El contenido de code no lleva formato inline, es texto plano.
                // Usamos escapeHtml() para que <, >, & se muestren literalmente.
                html += `<pre><code>${escapeHtml(block.children.map(c => c.text || '').join(''))}</code></pre>`;
                break;
            case 'image':
                // Las imágenes en Strapi v5 son objetos con url relativa.
                if (block.image?.url) {
                    html += `<img src="${STRAPI_URL}${block.image.url}" alt="${block.image.alternativeText || ''}" loading="lazy" width="750" height="auto">`;
                }
                break;
        }
    }
    return html;
}

/**
 * Convierte los hijos inline de un bloque a HTML con formato.
 *
 * Cada child puede tener propiedades booleanas de formato:
 *   bold, italic, underline, strikethrough, code, link
 *
 * Es importante el orden de las etiquetas: los enlaces deben ir por fuera
 * para que el bold/italic dentro del enlace sea HTML válido.
 */
function renderInline(children) {
    if (!children || !Array.isArray(children)) return '';
    return children.map(child => {
        let text = child.text || '';
        if (child.bold) text = `<strong>${text}</strong>`;
        if (child.italic) text = `<em>${text}</em>`;
        if (child.underline) text = `<u>${text}</u>`;
        if (child.strikethrough) text = `<s>${text}</s>`;
        if (child.code) text = `<code>${text}</code>`;
        // El link envuelve todo el texto formateado: <a href="..."><strong>texto</strong></a>
        if (child.link) text = `<a href="${child.link}">${text}</a>`;
        return text;
    }).join('');
}

/**
 * Escapa caracteres HTML especiales (<, >, &, etc.) usando el DOM.
 *
 * Preferimos esto a una expresión regular porque el DOM maneja correctamente
 * todos los caracteres Unicode y casos borde (por ejemplo, &amp; ya escapado).
 * Es el método recomendado por OWASP para escape de HTML en el navegador.
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ─── RENDERIZADO ─────────────────────────────────────────────────────────────

/**
 * Rellena el hero de la página con los datos del artículo.
 *
 * El hero es a pantalla completa con:
 *   - Imagen de fondo (con fallback a slide1.webp)
 *   - Badge de categoría
 *   - Título (se animará con SplitText después)
 *   - Fecha + ubicación
 *
 * toLocaleDateString('ca-ES') formatea la fecha en catalán:
 *   "19 de setembre de 2025" en vez de "2025-09-19"
 *
 * Los separadores de meta se ocultan si no hay ubicación para evitar
 * que aparezca un separador colgante: "Fecha | " sin nada después.
 */
function renderHero(article) {
    const catNames = {
        exposicion: 'Exposición',
        entrevista: 'Entrevista',
        colaboracion: 'Colaboración',
        reconocimiento: 'Reconocimiento',
        feria: 'Feria',
        otro: '',
    };

    const imgUrl = article.image || '../img/slide1.webp';
    const heroBg = document.getElementById('noticia-hero-bg');
    if (heroBg) heroBg.style.backgroundImage = `url('${imgUrl}')`;

    const catEl = document.getElementById('noticia-cat');
    const catLabel = catNames[article.category] || '';
    if (catEl) {
        catEl.textContent = catLabel;
        catEl.style.display = catLabel ? 'inline' : 'none';
    }

    document.title = `Victoria Taylor | ${article.title}`;

    const titleEl = document.getElementById('noticia-title');
    if (titleEl) titleEl.textContent = article.title;

    const dateEl = document.getElementById('noticia-date');
    if (dateEl) {
        const d = new Date(article.date + 'T12:00:00');
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = d.toLocaleDateString('ca-ES', options);
    }

    const locationEl = document.getElementById('noticia-location');
    if (locationEl) {
        if (article.location) {
            locationEl.textContent = article.location;
            locationEl.style.display = 'inline';
        } else {
            locationEl.style.display = 'none';
        }
    }

    // Oculta separadores si no hay ubicación para evitar " | " colgante.
    const metaSep = document.querySelectorAll('.noticia-meta-sep');
    metaSep.forEach(el => {
        el.style.display = article.location ? 'inline' : 'none';
    });
}

/**
 * Renderiza el cuerpo del artículo.
 *
 * Dos partes:
 *   1. description — texto corto destacado (va como párrafo con clase .noticia-desc)
 *   2. content — cuerpo largo, puede ser:
 *      - string HTML (fallback JSON)
 *      - array de bloques Strapi (que procesamos con renderBlocks)
 *
 * El typeof decide el tratamiento porque el fallback JSON guarda el contenido
 * como HTML plano mientras que Strapi lo devuelve como bloques estructurados.
 */
function renderContent(article) {
    const bodyEl = document.getElementById('noticia-body');
    if (!bodyEl) return;

    let html = '';

    if (article.description) {
        html += `<p class="noticia-desc">${article.description}</p>`;
    }

    if (article.content) {
        if (typeof article.content === 'string') {
            // Fallback JSON: el contenido ya viene como HTML
            html += article.content;
        } else {
            // Strapi v5: hay que convertir bloques → HTML
            html += renderBlocks(article.content);
        }
    }

    bodyEl.innerHTML = html;
}

// ─── ANIMACIONES GSAP ─────────────────────────────────────────────────────────
// En la página individual usamos timelines (gsap.timeline()) para coordinar
// secuencias de animación con solapamiento controlado, en vez de animaciones
// independientes con delays. La timeline permite que todo el hero entre en
// una coreografía precisa: imagen de fondo → overlay → badge → título → meta.

/**
 * Inicializa Lenis para smooth scroll en la página individual.
 *
 * Lenis reemplaza el scroll nativo del navegador por uno suave y sincronizado
 * con GSAP. Configuración clave:
 *   - duration: 1.2 — velocidad del scroll (más alto = más lento y suave)
 *   - easing exponencial — desaceleración natural, no lineal
 *   - Se integra con ScrollTrigger vía lenis.on('scroll') y gsap.ticker.add()
 *
 * Sin esta integración, las animaciones scroll-based de GSAP no funcionarían
 * con Lenis porque Lenis intercepta el scroll antes de que ScrollTrigger lo vea.
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
 * Timeline de entrada del hero con coreografía precisa.
 *
 * Secuencia temporal (en segundos desde el inicio de la timeline):
 *   0.0 — Hero bg: escala 1.3→1 con fade in (revelación cinematográfica)
 *   0.0 — Overlay: fade in (el gradiente oscuro que da legibilidad al texto)
 *   0.4 — Badge de categoría: slide down
 *   0.5 — Título: SplitText chars con rotación 3D (efecto GSAP Academy)
 *   0.9 — Meta (fecha + ubicación): slide up
 *
 * Los valores de posición (tercer parámetro de tl.to) permiten solapamiento
 * sin tener que calcular delays manualmente. Ej: 0.5 significa "empieza 0.5s
 * después del inicio de la timeline", no "0.5s después de que termine lo anterior".
 */
function initHeroAnimation() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Hero bg: escala de 1.3 a 1 con fade in. La escala inicial 1.3 da un
    // efecto de "zoom out" que revela la imagen de forma dramática.
    tl.fromTo('#noticia-hero-bg', {
        scale: 1.3,
        opacity: 0,
    }, {
        scale: 1,
        opacity: 1,
        duration: 1.6,
        ease: 'power2.out',
    }, 0);

    // Overlay: el gradiente oscuro aparece lentamente para que no haya un
    // corte brusco entre imagen sin gradiente y con gradiente.
    tl.fromTo('.noticia-hero-overlay', {
        opacity: 0,
    }, {
        opacity: 1,
        duration: 1.2,
    }, 0);

    // Categoría badge: slide down desde arriba (-20px)
    tl.from('#noticia-cat', {
        y: -20,
        opacity: 0,
        duration: 0.8,
    }, 0.4);

    // Título con SplitText: cada carácter rota en 3D mientras cae.
    // visibility:visible para evitar flash de SplitText ocultando el título.
    const titleEl = document.getElementById('noticia-title');
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

    // Meta info (fecha + ubicación): aparece después del título.
    tl.from('#noticia-meta', {
        y: 30,
        opacity: 0,
        duration: 0.8,
    }, 0.9);
}

/**
 * Animaciones activadas por scroll en la sección de contenido.
 *
 * Dos grupos:
 *   1. Botón "Tornar" — aparece con fade+slide cuando el usuario baja
 *   2. Párrafos/elementos del cuerpo — aparecen uno a uno (stagger 0.12s)
 *      cuando el contenedor .noticia-body llega al 85% del viewport.
 *
 * once:true en ambos — la animación solo se reproduce la primera vez
 * que el usuario scrollea hasta esa posición.
 */
function initContentAnimation() {
    const contentEl = document.getElementById('noticia-content');
    if (!contentEl) return;

    // Botón de volver atrás
    gsap.from('#noticia-back', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '#noticia-back',
            start: 'top 90%',
            toggleActions: 'play none none reverse',
            once: true,
        },
    });

    // Párrafos, titulares, citas, listas — aparecen en cascada al scrollear.
    // El selector incluye los tipos de bloque que puede generar renderBlocks()
    // para que todos los elementos tengan animación.
    const paragraphs = document.querySelectorAll('.noticia-body > p, .noticia-body > h2, .noticia-body > h3, .noticia-body > blockquote, .noticia-body > ul, .noticia-body > ol');
    if (paragraphs.length) {
        gsap.from(paragraphs, {
            y: 40,
            opacity: 0,
            duration: 0.7,
            stagger: { each: 0.12, from: 'start' },
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.noticia-body',
                start: 'top 85%',
                toggleActions: 'play none none reverse',
                once: true,
            },
        });
    }
}

/**
 * Efecto parallax en la imagen de fondo del hero.
 *
 * La imagen se mueve un 12% más lento que el scroll (yPercent:12).
 * Con scrub:1.5 el seguimiento es suave y elástico.
 *
 * El trigger y end están definidos por la sección hero para que el parallax
 * solo ocurra mientras el hero es visible en pantalla.
 */
function initParallax() {
    const heroBg = document.getElementById('noticia-hero-bg');
    if (!heroBg) return;

    gsap.to(heroBg, {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
            trigger: '#noticia-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
        },
    });
}

// ─── CARGA DE DATOS ───────────────────────────────────────────────────────────
// Mismo patrón resilient-first que noticias.js: Strapi → fallback JSON → error.

/**
 * Carga un artículo individual desde Strapi (o fallback) y dispara render + animaciones.
 *
 * Flujo:
 *   1. Lee ?id= de la URL → si no hay, muestra "Notícia no trobada."
 *   2. fetch a Strapi con filters[id][$eq]=${id} → busca el artículo por ID
 *   3. Si Strapi responde OK → normaliza campos, renderiza, anima
 *   4. Si Strapi falla → busca en JSON fallback por ID
 *   5. Si todo falla → mensaje de error
 *
 * Por qué filters[id][$eq]=X y no /api/articles/X:
 *   - Strapi v5 usa documentId (UUID) como identificador único en la URL directa.
 *   - El id numérico tradicional sigue existiendo pero no es accesible vía URL directa.
 *   - filters[id][$eq]=X funciona en ambas versiones de Strapi (v4 y v5).
 */
async function loadArticle() {
    const id = getUrlParam('id');
    if (!id) {
        document.getElementById('noticia-body').innerHTML = '<p>Notícia no trobada.</p>';
        return;
    }

    try {
        const res = await fetch(`${STRAPI_URL}/api/articles?filters[id][$eq]=${id}&populate=image`);
        if (!res.ok) throw new Error('Strapi no disponible');

        const body = await res.json();
        const a = Array.isArray(body.data) && body.data.length > 0 ? body.data[0] : null;
        if (!a) throw new Error('Article no trobat');

        // Normalización de campos (misma lógica que en noticias.js)
        const article = {
            id: a.id,
            title: a.title || a.Title || '',
            date: a.date || a.Date || '',
            image: typeof a.image === 'object' && a.image?.url
                ? `${STRAPI_URL}${a.image.url}`
                : typeof a.Image === 'object' && a.Image?.url
                ? `${STRAPI_URL}${a.Image.url}`
                : a.image || a.Image || '',
            description: a.description || a.Description || '',
            location: a.location || a.Location || '',
            category: a.category || '',
            content: a.content || '',
        };

        renderHero(article);
        renderContent(article);

        // Las animaciones se disparan después del renderizado porque necesitan
        // que los elementos existan en el DOM.
        initLenis();
        initHeroAnimation();
        initContentAnimation();
        initParallax();

    } catch (error) {
        console.warn('Strapi caigut, provant fallback...', error.message);

        try {
            const fallbackRes = await fetch(NEWS_JSON_FALLBACK);
            if (!fallbackRes.ok) throw new Error('Fallback no disponible');

            const fallbackData = await fallbackRes.json();
            const article = fallbackData.find(a => String(a.id) === id);

            if (!article) {
                document.getElementById('noticia-body').innerHTML = '<p>Notícia no trobada.</p>';
                return;
            }

            renderHero(article);
            renderContent(article);

            initLenis();
            initHeroAnimation();
            initContentAnimation();
            initParallax();

        } catch (fallbackError) {
            console.warn(fallbackError.message);
            document.getElementById('noticia-body').innerHTML = '<p>No s\'ha pogut carregar la notícia.</p>';
        }
    }
}

// ─── BOOT ─────────────────────────────────────────────────────────────────────
// A diferencia de noticias.js, aquí NO hay safety check del hero porque esta
// página SIEMPRE debe tener hero. Si no hay hero, algo está mal en el HTML.

document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    loadArticle();
});
