<?php
/* ==========================================================================
   artista.php — Página SSR del detall d'artista (Victoria Taylor)
   ========================================================================== */

require_once __DIR__ . '/includes/CmsClient.php';
require_once __DIR__ . '/includes/helpers.php';
require_once __DIR__ . '/includes/artistas-data.php';

/* ─── Boot ─── */
$slug = $_GET['id'] ?? '';
if (!$slug) {
    header('Location: artistas.php');
    exit;
}

$env = loadEnv(__DIR__ . '/.env');
$cmsUrl = $env['CMS_URL'] ?? 'https://voracms.voradata.cat';
$origin = $env['SSR_ORIGIN'] ?? 'https://victoriataylor.art';

if (!session_id()) session_start();
$cms = new CmsClient($cmsUrl, $origin);
$GLOBALS['cmsUrl'] = $cmsUrl;

/* ─── Cercar artista: hardcodejat primer, després CMS ─── */
$artista = $ARTISTAS_FIJOS[$slug] ?? null;

if (!$artista) {
    /* No trobat als fixos: buscar al CMS */
    $result = $cms->fetch('/api/public/victoria-taylor/artistes_victoria_taylor');
    $cmsArtists = $result['data'] ?? [];

    foreach ($cmsArtists as $entry) {
        $titol = $entry['titol'] ?? '';
        $entrySlug = slugify($titol) . '-' . $entry['id'];

        if ($entrySlug === $slug) {
            $imgUrl = null;
            if (!empty($entry['imatge'][0]['url'])) {
                $imgUrl = getVoraMediaUrl($entry['imatge'][0]['url']);
            }

            $bio = $entry['descripcio']
                ? array_values(array_filter(explode("\n", $entry['descripcio']), fn($p) => trim($p) !== ''))
                : [];

            $logros = [];
            foreach (($entry['logros'] ?? []) as $l) {
                $textos = $l['texto']
                    ? array_values(array_filter(explode("\n", $l['texto']), fn($t) => trim($t) !== ''))
                    : [];
                $logros[] = [
                    'año' => $l['año'] ?? '',
                    'textos' => toLang($textos)
                ];
            }

            $obras = [];
            foreach (($entry['galeria'] ?? []) as $o) {
                $obraImg = $o['url'] ? getVoraMediaUrl($o['url']) : '';
                $obras[] = [
                    'img' => $obraImg,
                    'titulo' => toLang($o['name'] ?? '')
                ];
            }

            $artista = [
                'id' => $slug,
                'nombre' => $titol,
                'rol' => toLang($entry['subtitol'] ?? ''),
                'cardImg' => $imgUrl,
                'heroImg' => $imgUrl,
                'instagram' => null,
                'bio' => toLang($bio),
                'logros' => $logros,
                'obras' => $obras
            ];
            break;
        }
    }
}

/* ─── Renderitzar ─── */
$notFound = !$artista;

/* Per SSR, renderitzar en català per defecte. JS pot cambiar d'idioma via JSON */
$lang = 'ca';

/* Helper per obtenir text en l'idioma actual */
function _t_ssr($obj, $lang = 'ca') {
    if (is_string($obj)) return $obj;
    if (is_array($obj) && isset($obj[$lang])) {
        $v = $obj[$lang];
        if (is_array($v)) return $v;
        return $v;
    }
    if (is_array($obj) && isset($obj['es'])) {
        $v = $obj['es'];
        if (is_array($v)) return $v;
        return $v;
    }
    return '';
}

/* Dades per al rendering */
$nombre = $artista ? _t_ssr($artista['nombre'], $lang) : '';
$nombreUpper = mb_strtoupper($nombre, 'UTF-8');
$rol = $artista ? _t_ssr($artista['rol'], $lang) : '';
$heroImg = $artista ? ($artista['heroImg'] ?? '') : '';

$bgPosition = $artista ? ($artista['bgPosition'] ?? '') : '';
$bio = $artista ? _t_ssr($artista['bio'], $lang) : [];
$logros = $artista ? ($artista['logros'] ?? []) : [];
$obras = $artista ? ($artista['obras'] ?? []) : [];

$pageTitle = $nombre ? "$nombre | Victoria Taylor" : 'Victoria Taylor | Artista';
$metaDesc = $rol ? htmlspecialchars($rol, ENT_QUOTES, 'UTF-8') : 'Perfil complet de l\'artista.';
$ogImage = $heroImg ?: 'https://victoriataylor.art/img/og-image.jpg';

/* Tracking visita */
if ($artista) {
    $cms->post('/api/visit', [
        'entry_id'    => 0,
        'path'        => "/artista/{$slug}",
        'client_ip'   => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
        'user_agent'  => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
    ]);
}
?>
<!DOCTYPE html>
<html lang="cat" class="page-html">
<head>
    <script>document.documentElement.classList.add('js-enabled');</script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?= $metaDesc ?>">
    <meta name="keywords" content="artista, biografia, trajectoria artistica, obres d'art, galeria">
    <meta name="author" content="Victoria Taylor - Global Brands Europe, SL">

    <meta property="og:type" content="website">
    <meta property="og:url" content="https://victoriataylor.art/artista.php?id=<?= htmlspecialchars($slug, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:title" content="<?= $pageTitle ?>">
    <meta property="og:description" content="<?= $metaDesc ?>">
    <meta property="og:image" content="<?= $ogImage ?>">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?= $pageTitle ?>">
    <meta name="twitter:description" content="<?= $metaDesc ?>">
    <meta name="twitter:image" content="<?= $ogImage ?>">

    <link rel="canonical" href="https://victoriataylor.art/artista.php?id=<?= htmlspecialchars($slug, ENT_QUOTES, 'UTF-8') ?>">

    <link rel="icon" type="image/avif" href="img/logo.avif">
    <link rel="apple-touch-icon" href="img/logo.avif">

    <title><?= $pageTitle ?></title>

    <link rel="stylesheet" href="css/style.css">

    <!-- GSAP Libraries -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/SplitText.min.js"></script>
</head>
<body class="page-body">

    <!-- Header -->
    <header id="header" class="main-header" aria-label="Navegació principal">
        <div class="header-container">
            <div class="logo">
                <a href="index.php" aria-label="Inici Victoria Taylor">
                    <img src="img/logo.avif" alt="Victoria Taylor Logo" class="header-logo">
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
                <a href="index.php" aria-label="Inici Victoria Taylor">
                    <img src="img/logo.avif" alt="Victoria Taylor Logo" class="header-logo">
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

    <?php if ($notFound): ?>

    <!-- 404 -->
    <main id="artist-main">
        <section class="artist-hero" aria-label="Artista no trobat">
            <div class="artist-hero-bg" style="background-image: url('img/slide1.webp');"></div>
            <div class="artist-hero-overlay"></div>
            <div class="artist-hero-content">
                <h1 class="artist-hero-title" style="visibility:hidden;">Artista no trobat</h1>
            </div>
        </section>
        <section class="artist-bio">
            <div class="artist-bio-inner">
                <p style="text-align:center;font-family:var(--font-secondary)">L'artista que busques no existeix o ha estat eliminat.</p>
                <p style="text-align:center;margin-top:var(--space-l)"><a href="artistas.php" style="color:var(--color-black);text-decoration:underline;font-family:var(--font-secondary);font-size:0.85rem">&larr; Tornar a artistes</a></p>
            </div>
        </section>
    </main>

    <script id="ssr-artista-data" type="application/json">null</script>

    <?php else: ?>

    <main id="artist-main">
        <!-- Hero -->
        <section class="artist-hero" aria-label="<?= htmlspecialchars($nombre, ENT_QUOTES, 'UTF-8') ?>">
            <div class="artist-hero-bg" style="background-image: url('<?= htmlspecialchars($heroImg, ENT_QUOTES, 'UTF-8') ?>');<?= $bgPosition ? ' background-position: ' . htmlspecialchars($bgPosition, ENT_QUOTES, 'UTF-8') . ';' : '' ?>"></div>
            <div class="artist-hero-overlay"></div>
            <div class="artist-hero-content">
                <?php if ($rol): ?>
                    <span class="artist-hero-rol" id="artista-rol"><?= htmlspecialchars($rol, ENT_QUOTES, 'UTF-8') ?></span>
                <?php endif; ?>
                <h1 class="artist-hero-title" id="artista-title"><?= htmlspecialchars($nombre, ENT_QUOTES, 'UTF-8') ?></h1>

            </div>
        </section>

        <!-- Bio -->
        <?php if (!empty($bio)): ?>
        <section class="artist-bio" id="artista-bio">
            <div class="artist-bio-inner">
                <h2 class="section-label" id="artista-label-sobre">Sobre l'artista</h2>
                <div class="artist-bio-text" id="artista-bio-text">
                    <?php foreach ($bio as $paragraf): ?>
                        <p><?= htmlspecialchars($paragraf, ENT_QUOTES, 'UTF-8') ?></p>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>
        <?php endif; ?>

        <!-- Logros / Trajectoria -->
        <?php if (!empty($logros)): ?>
        <section class="artist-logros" id="artista-logros">
            <div class="artist-logros-inner">
                <h2 class="section-label" id="artista-label-trajectoria">Trajectòria</h2>
                <div class="artist-timeline">
                    <?php foreach ($logros as $l):
                        $textos = _t_ssr($l['textos'], $lang);
                    ?>
                    <div class="artist-logro">
                        <span class="artist-logro-any"><?= htmlspecialchars($l['año'], ENT_QUOTES, 'UTF-8') ?></span>
                        <div class="artist-logro-textos">
                            <?php if (is_array($textos)): ?>
                                <?php foreach ($textos as $t): ?>
                                    <p><?= htmlspecialchars($t, ENT_QUOTES, 'UTF-8') ?></p>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>
        <?php endif; ?>

        <!-- Galeria d'obres -->
        <?php if (!empty($obras)): ?>
        <section class="artist-galeria" id="artista-galeria">
            <div class="artist-galeria-inner">
                <h2 class="section-label" id="artista-label-obres">Obres</h2>
                <div class="artist-obras-grid">
                    <?php foreach ($obras as $i => $o):
                        $titulo = isset($o['titulo']) ? _t_ssr($o['titulo'], $lang) : '';
                        // Si el título parece un nombre de archivo (termina en extensión de imagen), lo tratamos como vacío
                        if (preg_match('/\.(jpg|jpeg|png|gif|webp|avif)$/i', $titulo)) $titulo = '';
                    ?>
                    <article class="artist-obra" data-index="<?= $i ?>">
                        <div class="artist-obra-img">
                            <img src="<?= htmlspecialchars($o['img'] ?? '', ENT_QUOTES, 'UTF-8') ?>" alt="<?= htmlspecialchars($titulo ?: "Obra " . ($i + 1), ENT_QUOTES, 'UTF-8') ?>" loading="lazy">
                        </div>
                        <?php if ($titulo): ?>
                            <h3 class="artist-obra-titulo"><?= htmlspecialchars($titulo, ENT_QUOTES, 'UTF-8') ?></h3>
                        <?php endif; ?>
                    </article>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>
        <?php endif; ?>

        <!-- Modal Lightbox -->
        <div class="artista-modal" id="artista-modal" role="dialog" aria-modal="true" aria-label="Visor d'obres">
            <div class="artista-modal-overlay" id="artista-modal-overlay"></div>
            <button class="artista-modal-close" id="artista-modal-close" aria-label="Tancar visor">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <button class="artista-modal-prev" id="artista-modal-prev" aria-label="Anterior obra">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button class="artista-modal-next" id="artista-modal-next" aria-label="Següent obra">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <div class="artista-modal-content">
                <img class="artista-modal-img" id="artista-modal-img" src="" alt="">
                <p class="artista-modal-titulo" id="artista-modal-titulo"></p>
            </div>
        </div>
    </main>

    <script id="ssr-artista-data" type="application/json">
        <?= json_encode($artista, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>
    </script>

    <?php endif; ?>

    <!-- Footer -->
    <footer class="main-footer">
        <div class="footer-grid">
            <div class="footer-brand">
                <img src="img/logo.avif" alt="Victoria Taylor" class="footer-logo-img">
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
                        <p>Carrer Pic de Peguera, 11<br>17003 GIRONA</p>
                    </div>
                    <div class="footer-office">
                        <span class="footer-city" data-i18n="footer.london">London</span>
                        <p>112 Whitechapel High St<br>E1 7AQ LONDON</p>
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

    <script src="js/script.js?v=2"></script>
</body>
</html>