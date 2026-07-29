<?php
/* ==========================================================================
   evento.php — Página SSR del detall d'event (Victoria Taylor)
   ========================================================================== */

require_once __DIR__ . '/includes/CmsClient.php';

function loadEnv($path) {
    if (!file_exists($path)) return [];
    $vars = [];
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $vars[trim($parts[0])] = trim($parts[1]);
        }
    }
    return $vars;
}

function getVoraMediaUrl($path) {
    if (!$path) return '';
    if (strpos($path, 'http') === 0) return $path;
    return $GLOBALS['cmsUrl'] . $path;
}

function formatEventDate($dateString) {
    if (!$dateString) return '';
    $timestamp = strtotime($dateString);
    if (!$timestamp) return '';
    setlocale(LC_TIME, 'ca_ES.UTF-8', 'ca_ES', 'ca');
    $mesos = [
        1 => 'de gener', 2 => 'de febrer', 3 => 'de març',
        4 => 'd\'abril', 5 => 'de maig', 6 => 'de juny',
        7 => 'de juliol', 8 => 'd\'agost', 9 => 'de setembre',
        10 => 'd\'octubre', 11 => 'de novembre', 12 => 'de desembre'
    ];
    $dia = (int) date('j', $timestamp);
    $mes = (int) date('n', $timestamp);
    $any = date('Y', $timestamp);
    return $dia . ' ' . $mesos[$mes] . ' del ' . $any;
}

function cleanRichText($html) {
    if (empty($html)) return '';
    $html = preg_replace('/<p>\s*(<br\s*\/?>|&nbsp;|\s*)\s*<\/p>/i', '<!--PX_BR-->', $html);
    $html = preg_replace('/([\.!\?\:"])\s*<\/p>\s*<p([^>]*)>/i', '$1</p><!--REAL_BR--><p$2>', $html);
    $html = preg_replace('/<\/p>\s*<p([^>]*)>/i', ' ', $html);
    $html = str_replace('<!--REAL_BR-->', '', $html);
    $html = str_replace('<!--PX_BR-->', '<p><br></p>', $html);
    return $html;
}

/* ─── Boot ─── */
$id = $_GET['id'] ?? 0;
if (!$id) {
    header('Location: agenda.php');
    exit;
}

$env = loadEnv(__DIR__ . '/.env');
$cmsUrl = $env['CMS_URL'] ?? 'https://voracms.voradata.cat';
$origin = $env['SSR_ORIGIN'] ?? 'https://victoriataylor.art';

if (!session_id()) session_start();

$cms = new CmsClient($cmsUrl, $origin);

/* ─── Tracking visita ─── */
$cms->post('/api/visit', [
    'entry_id'    => (int) $id,
    'path'        => "/event/{$id}",
    'client_ip'   => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
    'user_agent'  => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
]);

/* ─── Ferry detall ─── */
$result = $cms->fetch("/api/public/victoria-taylor/event/{$id}");
$event = ($result && isset($result['data'])) ? $result['data'] : null;

/* ─── Extreure dades ─── */
$img = $event['imatge'][0] ?? null;
$imgUrl = $img ? getVoraMediaUrl($img['url']) : '';
$titul = htmlspecialchars($event['titol'] ?? '', ENT_QUOTES, 'UTF-8');
$dataFormatada = formatEventDate($event['data'] ?? '');
$hora = htmlspecialchars($event['hora'] ?? '', ENT_QUOTES, 'UTF-8');
$ubicacio = htmlspecialchars($event['ubicacio'] ?? '', ENT_QUOTES, 'UTF-8');
$descripcio = cleanRichText($event['descripcio'] ?? '');
if ($descripcio) {
    $descripcio = str_replace('src="/', 'src="' . $cmsUrl . '/', $descripcio);
}
$ctaUrl = htmlspecialchars($event['cta_url'] ?? '', ENT_QUOTES, 'UTF-8');
$ctaText = htmlspecialchars($event['cta_text'] ?? 'Més informació', ENT_QUOTES, 'UTF-8');
$pageTitle = $titul ? $titul . ' | Victoria Taylor' : 'Victoria Taylor | Event';
$metaDesc = $event['descripcio_curta'] ?? ($event['descripcio'] ?? '');
$metaDesc = $metaDesc ? htmlspecialchars(mb_substr(strip_tags($metaDesc), 0, 155), ENT_QUOTES, 'UTF-8') : 'Detalls de l\'esdeveniment: data, ubicació, horaris i informació pràctica.';
$ogImage = $imgUrl ?: 'https://victoriataylor.art/img/og-image.jpg';
?>
<!doctype html>
<html lang="cat" class="page-html">
<head>
    <script>document.documentElement.classList.add('js-enabled');</script>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="<?= $metaDesc ?>" />
    <meta name="keywords" content="esdeveniment art, exposició, inauguració, agenda cultural, informació pràctica" />
    <meta name="author" content="Victoria Taylor - Global Brands Europe, SL" />

    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://victoriataylor.art/evento.php?id=<?= $id ?>" />
    <meta property="og:title" content="<?= $titul ?: 'Event | Victoria Taylor' ?>" />
    <meta property="og:description" content="<?= $metaDesc ?>" />
    <meta property="og:image" content="<?= $ogImage ?>" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="<?= $titul ?: 'Event | Victoria Taylor' ?>" />
    <meta name="twitter:description" content="<?= $metaDesc ?>" />
    <meta name="twitter:image" content="<?= $ogImage ?>" />

    <link rel="canonical" href="https://victoriataylor.art/evento.php?id=<?= $id ?>" />

    <link rel="icon" type="image/avif" href="img/logo.avif" />
    <link rel="apple-touch-icon" href="img/logo.avif" />

    <title><?= $pageTitle ?></title>

    <link rel="stylesheet" href="css/style.css" />
    <link rel="stylesheet" href="css/evento.css" />

    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/SplitText.min.js"></script>
</head>
<body class="page-body">

    <!-- Header -->
    <header id="header" class="main-header" aria-label="Navegació principal">
        <div class="header-container">
            <div class="logo">
                <a href="index.html" aria-label="Inici Victoria Taylor">
                    <img src="img/logo.avif" alt="Victoria Taylor Logo" class="header-logo" />
                </a>
            </div>
            <nav class="desktop-nav" aria-label="Navegació de sobretaula">
                <ul class="nav-list">
                    <li><a href="nosotros.php" class="nav-link" data-i18n="nav.nosotros">Nosotros</a></li>
                    <li><a href="artistas.php" class="nav-link" data-i18n="nav.artistas">Artistas</a></li>
                    <li><a href="agenda.php" class="nav-link" data-i18n="nav.agenda">Agenda</a></li>
                    <li><a href="noticias.php" class="nav-link" data-i18n="nav.noticias">Noticias</a></li>
                    <li><a href="html/contacto.html" class="nav-link" data-i18n="nav.contacto">Contacto</a></li>
                </ul>
            </nav>

            <div class="lang-dropdown">
                <button class="lang-dropdown__trigger" aria-label="Seleccionar idioma">
                    <span class="lang-switcher__flag lang-switcher__flag--es" id="current-flag"></span>
                    <span class="lang-dropdown__arrow">▼</span>
                </button>
                <ul class="lang-dropdown__list">
                    <li><button class="lang-btn lang-btn--active" data-lang="es" aria-label="Español"><span class="lang-switcher__flag lang-switcher__flag--es"></span>ES</button></li>
                    <li><button class="lang-btn" data-lang="ca" aria-label="Català"><span class="lang-switcher__flag lang-switcher__flag--ca"></span>CA</button></li>
                    <li><button class="lang-btn" data-lang="en" aria-label="English"><span class="lang-switcher__flag lang-switcher__flag--en"></span>EN</button></li>
                </ul>
            </div>

            <button class="menu-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="Obrir menú">
                <span class="hamburger-line line-1"></span>
                <span class="hamburger-line line-2"></span>
            </button>
        </div>
        <nav id="mobile-nav" class="mobile-nav" aria-label="Navegació mòbil">
            <div class="logo">
                <a href="index.html" aria-label="Inici Victoria Taylor">
                    <img src="img/logo.avif" alt="Victoria Taylor Logo" class="header-logo" />
                </a>
            </div>
            <ul class="mobile-nav-list">
                <li><a href="nosotros.php" class="mobile-link" data-i18n="nav.nosotros">Nosotros</a></li>
                <li><a href="artistas.php" class="mobile-link" data-i18n="nav.artistas">Artistas</a></li>
                <li><a href="agenda.php" class="mobile-link" data-i18n="nav.agenda">Agenda</a></li>
                <li><a href="noticias.php" class="mobile-link" data-i18n="nav.noticias">Noticias</a></li>
                <li><a href="html/contacto.html" class="mobile-link" data-i18n="nav.contacto">Contacto</a></li>
            </ul>

            <div class="mobile-lang">
                <button class="mobile-lang-btn mobile-lang-btn--active" data-lang="es"><span class="lang-switcher__flag lang-switcher__flag--es"></span>ES</button>
                <button class="mobile-lang-btn" data-lang="ca"><span class="lang-switcher__flag lang-switcher__flag--ca"></span>CA</button>
                <button class="mobile-lang-btn" data-lang="en"><span class="lang-switcher__flag lang-switcher__flag--en"></span>EN</button>
            </div>
        </nav>
    </header>

    <!-- Main -->
    <main id="evento-main">
        <?php if ($event): ?>
            <section class="evento-hero" id="evento-hero">
                <div class="evento-hero-bg" id="evento-hero-bg" style="background-image: url('<?= htmlspecialchars($imgUrl, ENT_QUOTES, 'UTF-8') ?>');"></div>
                <div class="evento-hero-overlay"></div>
                <div class="evento-hero-content">
                    <h1 class="evento-title" id="evento-title" style="visibility:hidden;"><?= $titul ?></h1>
                    <div class="evento-meta" id="evento-meta">
                        <?php if ($dataFormatada): ?>
                            <span class="evento-date" id="evento-date"><?= htmlspecialchars($dataFormatada, ENT_QUOTES, 'UTF-8') ?></span>
                        <?php endif; ?>
                        <?php if ($hora && $dataFormatada): ?>
                            <span class="evento-meta-sep"></span>
                        <?php endif; ?>
                        <?php if ($hora): ?>
                            <span class="evento-time" id="evento-time"><?= htmlspecialchars($hora, ENT_QUOTES, 'UTF-8') ?></span>
                        <?php endif; ?>
                        <?php if ($ubicacio && ($dataFormatada || $hora)): ?>
                            <span class="evento-meta-sep"></span>
                        <?php endif; ?>
                        <?php if ($ubicacio): ?>
                            <span class="evento-location" id="evento-location"><?= htmlspecialchars($ubicacio, ENT_QUOTES, 'UTF-8') ?></span>
                        <?php endif; ?>
                    </div>
                </div>
            </section>

            <article class="evento-content" id="evento-content">
                <div class="evento-content-inner">
                    <a href="agenda.php" class="evento-back" id="evento-back">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Tornar a l'agenda
                    </a>
                    <div class="evento-body" id="evento-body">
                        <?= $descripcio ?>
                    </div>
                    <?php if ($ctaUrl): ?>
                        <div class="evento-cta-wrap" id="evento-cta-wrap">
                            <a href="<?= $ctaUrl ?>" class="evento-cta" id="evento-cta-link" target="_blank" rel="noopener"><?= $ctaText ?></a>
                        </div>
                    <?php endif; ?>

                    <?php if (!empty($event['galeria'])): ?>
                        <div class="evento-gallery">
                            <div class="evento-gallery-grid">
                                <?php foreach ($event['galeria'] as $gImg): ?>
                                    <?php 
                                        $gImgUrl = getVoraMediaUrl($gImg['url']); 
                                        $gImgAlt = htmlspecialchars($gImg['name'] ?? '', ENT_QUOTES, 'UTF-8');
                                    ?>
                                    <div class="evento-gallery-item">
                                        <img src="<?= htmlspecialchars($gImgUrl, ENT_QUOTES, 'UTF-8') ?>" alt="<?= $gImgAlt ?>" loading="lazy" />
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    <?php endif; ?>
                </div>
            </article>
        <?php else: ?>
            <section class="evento-hero" id="evento-hero">
                <div class="evento-hero-bg" style="background-image: url('img/slide1.webp');"></div>
                <div class="evento-hero-overlay"></div>
                <div class="evento-hero-content">
                    <h1 class="evento-title" id="evento-title" style="visibility:hidden;">Event no trobat</h1>
                </div>
            </section>

            <article class="evento-content" id="evento-content">
                <div class="evento-content-inner" style="text-align:center;padding:var(--space-xxl) 0;">
                    <p style="font-family:var(--font-secondary);font-size:1rem;color:rgba(0,0,0,0.5);">L'esdeveniment que busques no existeix o ha estat eliminat.</p>
                    <a href="agenda.php" class="evento-back" style="margin-top:var(--space-l);">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Tornar a l'agenda
                    </a>
                </div>
            </article>

            <script id="ssr-evento-data" type="application/json">null</script>
        <?php endif; ?>
    </main>

    <!-- Footer -->
    <footer class="main-footer">
        <div class="footer-grid">
            <div class="footer-brand">
                <img src="img/logo.avif" alt="Victoria Taylor" class="footer-logo-img" />
                <p class="footer-tagline" data-i18n="footer.tagline">Descubrimos y promovemos artistas con un talento excepcional.</p>
                <div class="footer-social">
                    <a href="https://www.instagram.com/victoriataylor.art/" target="_blank" rel="noopener" class="footer-social-link" aria-label="Instagram Victoria Taylor">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    </a>
                </div>
            </div>
            <div class="footer-nav-col">
                <h4 class="footer-col-title" data-i18n="footer.menu">Menú</h4>
                <ul class="footer-nav">
                    <li><a href="nosotros.php" data-i18n="nav.nosotros">Nosotros</a></li>
                    <li><a href="artistas.php" data-i18n="nav.artistas">Artistas</a></li>
                    <li><a href="agenda.php" data-i18n="nav.agenda">Agenda</a></li>
                    <li><a href="noticias.php" data-i18n="nav.noticias">Noticias</a></li>
                    <li><a href="html/contacto.html" data-i18n="nav.contacto">Contacto</a></li>
                </ul>
            </div>
            <div class="footer-contact-col">
                <h4 class="footer-col-title" data-i18n="footer.contacto">Contacto</h4>
                <div class="footer-offices">
                    <div class="footer-office">
                        <span class="footer-city" data-i18n="footer.girona">Girona</span>
                        <p>Carrer Pic de Peguera, 11<br />17003 GIRONA</p>
                    </div>
                    <div class="footer-office">
                        <span class="footer-city" data-i18n="footer.london">London</span>
                        <p>112 Whitechapel High St<br />E1 7AQ LONDON</p>
                    </div>
                </div>
                <a href="mailto:info@victoriataylor.art" class="footer-email">info@victoriataylor.art</a>
            </div>
        </div>
        <div class="footer-bottom">
            <p class="footer-copy" data-i18n="footer.copyright">© 2026 Victoria Taylor · Global Brands Europe, SL</p>
            <p class="footer-developed"><span data-i18n="footer.developed">Desarrollado por</span> <a href="https://vorastudio.cat" target="_blank" rel="noopener noreferrer" class="footer-vora-link"><img src="img/logoVora.png" alt="Vora Studio" class="footer-vora-logo" height="16" /></a></p>
            <ul class="footer-legal">
                <li><a href="html/avisolegal.html" data-i18n="footer.legal.aviso">Aviso legal</a></li>
                <li><a href="html/privacidad.html" data-i18n="footer.legal.privacidad">Privacidad</a></li>
                <li><a href="html/cookies.html" data-i18n="footer.legal.cookies">Cookies</a></li>
                <li><a href="html/accesibilidad.html" data-i18n="footer.legal.accesibilidad">Accesibilidad</a></li>
            </ul>
        </div>
    </footer>

    <?php if ($event): ?>
    <script id="ssr-evento-data" type="application/json">
        <?= json_encode($event, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>
    </script>
    <?php endif; ?>

    <script src="js/script.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // Create Modal HTML dynamically and append to body
            const modalHTML = `
                <div class="artista-modal" aria-hidden="true" role="dialog" aria-label="Visor d'imatges" style="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;visibility:hidden;opacity:0;">
                    <div class="artista-modal-overlay" style="position:absolute;inset:0;background:rgba(0,0,0,0.92);backdrop-filter:blur(8px);"></div>
                    <button class="artista-modal-close" aria-label="Tancar" style="position:absolute;top:30px;right:30px;background:none;border:none;color:#fff;font-size:35px;cursor:pointer;z-index:2;">&times;</button>
                    <button class="artista-modal-prev" aria-label="Anterior" style="position:absolute;top:50%;left:30px;transform:translateY(-50%);background:none;border:none;color:#fff;cursor:pointer;z-index:2;">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <button class="artista-modal-next" aria-label="Següent" style="position:absolute;top:50%;right:30px;transform:translateY(-50%);background:none;border:none;color:#fff;cursor:pointer;z-index:2;">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                    <div class="artista-modal-content" style="position:relative;z-index:1;max-width:85vw;max-height:85vh;display:flex;flex-direction:column;align-items:center;">
                        <img class="artista-modal-img" src="" alt="" style="max-width:100%;max-height:75vh;object-fit:contain;display:block;border-radius:4px;">
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            const modal = document.querySelector('.artista-modal');
            const modalImg = modal.querySelector('.artista-modal-img');
            const modalClose = modal.querySelector('.artista-modal-close');
            const modalPrev = modal.querySelector('.artista-modal-prev');
            const modalNext = modal.querySelector('.artista-modal-next');
            
            let currentIdx = 0;
            let imageList = [];
            
            function openModal(idx) {
                currentIdx = idx;
                modalImg.src = imageList[currentIdx].src;
                modalImg.alt = imageList[currentIdx].alt || '';
                
                if (imageList.length <= 1) {
                    modalPrev.style.display = 'none';
                    modalNext.style.display = 'none';
                } else {
                    modalPrev.style.display = 'block';
                    modalNext.style.display = 'block';
                }
                
                gsap.set(modal, { visibility: 'visible' });
                gsap.to(modal, { opacity: 1, duration: 0.4, ease: 'power2.out' });
                gsap.fromTo(modalImg, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' });
                modal.setAttribute('aria-hidden', 'false');
            }
            
            function closeModal() {
                gsap.to(modal, { opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => {
                    gsap.set(modal, { visibility: 'hidden' });
                    modal.setAttribute('aria-hidden', 'true');
                }});
            }
            
            function navigate(direction) {
                currentIdx = (currentIdx + direction + imageList.length) % imageList.length;
                gsap.fromTo(modalImg, { opacity: 0, scale: 0.95 }, {
                    opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out',
                    onStart: () => {
                        modalImg.src = imageList[currentIdx].src;
                        modalImg.alt = imageList[currentIdx].alt || '';
                    }
                });
            }
            
            const targetSelectors = '.evento-gallery-item img, .evento-body img';
            
            function updateImageList() {
                imageList = Array.from(document.querySelectorAll(targetSelectors));
            }
            updateImageList();
            
            document.addEventListener('click', (e) => {
                if (e.target.matches(targetSelectors)) {
                    updateImageList();
                    const idx = imageList.indexOf(e.target);
                    if (idx !== -1) {
                        openModal(idx);
                    }
                }
            });
            
            modalClose.addEventListener('click', closeModal);
            modalPrev.addEventListener('click', () => navigate(-1));
            modalNext.addEventListener('click', () => navigate(1));
            modal.querySelector('.artista-modal-overlay').addEventListener('click', closeModal);
            document.addEventListener('keydown', (e) => {
                if (modal.getAttribute('aria-hidden') === 'false') {
                    if (e.key === 'Escape') closeModal();
                    if (e.key === 'ArrowLeft') navigate(-1);
                    if (e.key === 'ArrowRight') navigate(1);
                }
            });

            // --- ANIMACIONS GSAP (Idénticas a la ficha de artista) ---
            const heroTitle = document.querySelector('.evento-title');
            if (heroTitle && typeof SplitText !== 'undefined') {
                const split = new SplitText(heroTitle, { type: 'words,chars' });
                heroTitle.style.visibility = 'visible';
                gsap.from(split.chars, {
                    opacity: 0, y: 80, rotateX: -90, stagger: 0.04,
                    duration: 1, ease: 'power4.out', delay: 0.3
                });
            }

            gsap.from('.evento-label, .evento-meta', {
                opacity: 0, y: 30, duration: 1, ease: 'power3.out',
                delay: 0.8, stagger: 0.15
            });

            const heroBg = document.querySelector('.evento-hero-bg');
            if (heroBg) {
                gsap.to(heroBg, {
                    yPercent: 15, ease: 'none',
                    scrollTrigger: { trigger: '.evento-hero', start: 'top top', end: 'bottom top', scrub: 1 }
                });
            }

            const bioParas = document.querySelectorAll('.evento-body p');
            if (bioParas.length && typeof SplitText !== 'undefined') {
                gsap.set('.evento-body p', { perspective: '800px', transformStyle: 'preserve-3d' });
                const bioSplit = new SplitText('.evento-body p', { type: 'lines', mask: 'lines' });
                gsap.from(bioSplit.lines, {
                    opacity: 0, y: 40, duration: 1, ease: 'power3.out', stagger: 0.2,
                    scrollTrigger: { trigger: '.evento-content', start: 'top 60%', toggleActions: 'play none none reverse' }
                });
            }

            const galleryGrid = document.querySelector('.evento-gallery');
            if (galleryGrid) {
                gsap.from('.evento-gallery-item', {
                    opacity: 0, y: 60, duration: 0.8, ease: 'power3.out', stagger: 0.2,
                    scrollTrigger: { trigger: '.evento-gallery', start: 'top 60%', toggleActions: 'play none none reverse' }
                });
            }
        });
    </script>
</body>
</html>