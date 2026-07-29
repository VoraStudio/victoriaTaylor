<?php
/* ==========================================================================
   artistas.php — Página SSR del llistat d'artistes (Victoria Taylor)
   ========================================================================== */

require_once __DIR__ . '/includes/CmsClient.php';
require_once __DIR__ . '/includes/helpers.php';
require_once __DIR__ . '/includes/artistas-data.php';

/* ─── Boot ─── */
$env = loadEnv(__DIR__ . '/.env');
$cmsUrl = $env['CMS_URL'] ?? 'https://voracms.voradata.cat';
$origin = $env['SSR_ORIGIN'] ?? 'https://victoriataylor.art';

if (!session_id()) session_start();

$cms = new CmsClient($cmsUrl, $origin);
$GLOBALS['cmsUrl'] = $cmsUrl;

/* ─── Tracking visita ─── */
$cms->post('/api/visit', [
    'entry_id'    => 0,
    'path'        => '/artistas',
    'client_ip'   => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
    'user_agent'  => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
]);

/* ─── Ferry + Merge ─── */
$result = $cms->fetch('/api/public/victoria-taylor/artistes_victoria_taylor');
$cmsArtists = $result['data'] ?? [];

/* Transformar CMS entries al format hardcodejat i mergejar */
$artistas = $ARTISTAS_FIJOS;

/* Indexar slugs fixes per evitar duplicats */
$fijosSlugs = array_keys($ARTISTAS_FIJOS);
$fijosBaseSlugs = [];
foreach ($fijosSlugs as $s) {
    $fijosBaseSlugs[slugify($s)] = true;
}

foreach ($cmsArtists as $entry) {
    $titol = $entry['titol'] ?? '';
    $baseSlug = slugify($titol);
    $slug = $baseSlug . '-' . $entry['id'];

    /* Si ja existeix com a fix (per nom), no sobreescriure */
    if (isset($artistas[$slug]) || isset($fijosBaseSlugs[$baseSlug])) continue;

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

    $artistas[$slug] = [
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
}
?>
<!DOCTYPE html>
<html lang="cat" class="page-html">
<head>
    <script>document.documentElement.classList.add('js-enabled');</script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Artistes contemporanis representats per Victoria Taylor: Cristina Montero, David Thorne, HUBO, IOL Baques, Juda Munoz, Mohammed Er Rabehy, Rosa Martin.">
    <meta name="keywords" content="artistes contemporanis, Cristina Montero, David Thorne, HUBO, IOL Baques, Juda Munoz, Mohammed Er Rabehy, Rosa Martin, galeria d'art">
    <meta name="author" content="Victoria Taylor - Global Brands Europe, SL">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://victoriataylor.art/artistas.php">
    <meta property="og:title" content="Artistas | Victoria Taylor">
    <meta property="og:description" content="Artistes contemporanis representats per Victoria Taylor.">
    <meta property="og:image" content="https://victoriataylor.art/img/og-image.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Artistas | Victoria Taylor">
    <meta name="twitter:description" content="Artistes contemporanis representats per Victoria Taylor.">
    <meta name="twitter:image" content="https://victoriataylor.art/img/og-image.jpg">

    <!-- Canonical -->
    <link rel="canonical" href="https://victoriataylor.art/artistas.php">

    <!-- Favicon -->
    <link rel="icon" type="image/avif" href="img/logo.avif">
    <link rel="apple-touch-icon" href="img/logo.avif">

    <title>Victoria Taylor | Artistas</title>
    <!-- Custom CSS -->
    <link rel="stylesheet" href="css/style.css">
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
                    <li><a href="artistas.php" class="nav-link active" data-i18n="nav.artistas">Artistas</a></li>
                    <li><a href="agenda.php" class="nav-link" data-i18n="nav.agenda">Agenda</a></li>
                    <li><a href="noticias.php" class="nav-link" data-i18n="nav.noticias">Noticias</a></li>
                    <li><a href="html/contacto.html" class="nav-link" data-i18n="nav.contacto">Contacto</a></li>
                </ul>
            </nav>

        <!-- Selector d'idioma -->
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
                <li><a href="artistas.php" class="mobile-link active" data-i18n="nav.artistas">Artistas</a></li>
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

    <main>
        <section class="about-artists" aria-labelledby="about-artists-title">
            <div class="about-artists-header">
                <h2 id="about-artists-title" class="about-artists-title"><span class="about-artists-line1" data-i18n="artistas.title1">Unimos artistas</span> <span data-i18n="artistas.title2">contemporáneos</span>
                    <br class="about-artists-break">
                    <span data-i18n="artistas.title3">con coleccionistas</span></h2>
                <p class="about-artists-subtitle" data-i18n="artistas.subtitle">que buscan piezas únicas, auténticas y con valor emocional y artístico</p>
            </div>

            <div class="about-artists-grid">
                <?php $idx = 0; foreach ($artistas as $slug => $a):
                    $nombre = $a['nombre'];
                    $cardImg = $a['cardImg'] ?? '';
                    $heroImg = $a['heroImg'] ?? '';
                    $imgSrc = $cardImg ?: $heroImg;
                    $imgAlt = htmlspecialchars(is_string($nombre) ? $nombre : ($nombre['ca'] ?? $nombre['es'] ?? ''), ENT_QUOTES, 'UTF-8');
                ?>
                <a href="artista.php?id=<?= htmlspecialchars($slug, ENT_QUOTES, 'UTF-8') ?>" class="artist-card-link">
                    <article class="artist-card">
                        <div class="artist-card-img">
                            <?php if ($imgSrc): ?>
                                <img src="<?= htmlspecialchars($imgSrc, ENT_QUOTES, 'UTF-8') ?>" alt="<?= $imgAlt ?>" loading="lazy">
                            <?php else: ?>
                                <div class="artist-card-placeholder"></div>
                            <?php endif; ?>
                        </div>
                        <h3 class="artist-card-name"><?= strtoupper($imgAlt) ?></h3>
                    </article>
                </a>
                <?php $idx++; endforeach; ?>
            </div>
        </section>
    </main>
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

    <script id="ssr-artistas-data" type="application/json">
        <?= json_encode($artistas, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>
    </script>

    <!-- GSAP Libraries -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/SplitText.min.js"></script>
    <script src="js/script.js"></script>
</body>
</html>