<?php
/* ==========================================================================
   noticias.php — Página SSR del llistat de notícies (Victoria Taylor)
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

function formatDate($dateString) {
    if (!$dateString) return '';
    $timestamp = strtotime($dateString);
    if (!$timestamp) return '';
    setlocale(LC_TIME, 'ca_ES.UTF-8', 'ca_ES', 'ca');
    $meses = [
        1 => 'de gener', 2 => 'de febrer', 3 => 'de mar&ccedil;',
        4 => 'd\'abril', 5 => 'de maig', 6 => 'de juny',
        7 => 'de juliol', 8 => 'd\'agost', 9 => 'de setembre',
        10 => 'd\'octubre', 11 => 'de novembre', 12 => 'de desembre'
    ];
    $dia = (int) date('j', $timestamp);
    $mes = (int) date('n', $timestamp);
    $any = date('Y', $timestamp);
    return $dia . ' ' . $meses[$mes] . ' del ' . $any;
}

/* ─── Boot ─── */
$env = loadEnv(__DIR__ . '/.env');
$cmsUrl = $env['CMS_URL'] ?? 'https://voracms.voradata.cat';
$origin = $env['SSR_ORIGIN'] ?? 'https://victoriataylor.art';

if (!session_id()) session_start();

$cms = new CmsClient($cmsUrl, $origin);

/* ─── Tracking visita ─── */
$cms->post('/api/visit', [
    'entry_id'    => 0,
    'path'        => '/noticias',
    'client_ip'   => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
    'user_agent'  => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
]);

/* ─── Ferry dades ─── */
$result = $cms->fetch('/api/public/victoria-taylor/noticia');
$noticias = $result['data'] ?? [];
$latest = array_slice($noticias, 0, 3);
$historical = array_slice($noticias, 3);

/* ─── Debug: llistar seccions disponibles al CMS ─── */
$sections = $cms->fetch('/api/sections?active=true');
?>
<!DOCTYPE html>
<html lang="cat" class="page-html">
<head>
    <script>document.documentElement.classList.add('js-enabled');</script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Tota l'actualitat de Victoria Taylor: exposicions, entrevistes i novetats del mon de l'art contemporani.">
    <meta name="keywords" content="noticies art, actualitat artistica, exposicions, entrevistes artistes, art contemporani">
    <meta name="author" content="Victoria Taylor - Global Brands Europe, SL">

    <meta property="og:type" content="website">
    <meta property="og:url" content="https://victoriataylor.art/noticias.php">
    <meta property="og:title" content="Notícies | Victoria Taylor">
    <meta property="og:description" content="Tota l'actualitat de Victoria Taylor: exposicions, entrevistes i novetats del mon de l'art contemporani.">
    <meta property="og:image" content="https://victoriataylor.art/img/og-image.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Notícies | Victoria Taylor">
    <meta name="twitter:description" content="Tota l'actualitat de Victoria Taylor: exposicions, entrevistes i novetats del mon de l'art contemporani.">
    <meta name="twitter:image" content="https://victoriataylor.art/img/og-image.jpg">

    <link rel="canonical" href="https://victoriataylor.art/noticias.php">

    <link rel="icon" type="image/avif" href="img/logo.avif">
    <link rel="apple-touch-icon" href="img/logo.avif">

    <title>Victoria Taylor | Notícies</title>

    <link rel="stylesheet" href="css/style.css?v=2">
    <link rel="stylesheet" href="css/noticias.css">

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

    <!-- Main -->
    <main>
        <section class="news-hero" aria-label="Not&iacute;cies">
            <div class="news-hero-bg" style="background-image: url('img/slide3.webp');"></div>
            <div class="news-hero-overlay"></div>
            <div class="news-hero-content">
                <h1 class="news-hero-title" data-i18n="noticias.hero.title">Notícies</h1>
                <p class="news-hero-subtitle" data-i18n="noticias.hero.subtitle">Tota l'actualitat de Victoria Taylor: exposicions, entrevistes i novetats del món de l'art contemporani.</p>
            </div>
        </section>

        <section class="news-section" aria-label="Not&iacute;cies">
                <div class="news-tabs" role="tablist" aria-label="Filtrar not&iacute;cies">
                    <button id="news-tab-latest" class="news-tab is-active" role="tab" aria-selected="true" aria-controls="news-list" type="button">
                        &Uacute;ltimes <span id="news-count-latest" class="news-tab-count">(<?= count($latest) ?>)</span>
                    </button>
                    <button id="news-tab-historical" class="news-tab" role="tab" aria-selected="false" aria-controls="news-list" type="button">
                        Hist&ograve;ric <span id="news-count-historical" class="news-tab-count">(<?= count($historical) ?>)</span>
                    </button>
                </div>

                <div id="news-list" class="news-grid-container" role="tabpanel">
                    <!-- Latest news list -->
                    <div id="news-latest" class="news-grid-inner">
                        <?php if (empty($latest)): ?>
                            <div class="news-empty">No hi ha not&iacute;cies recents actualment.</div>
                        <?php else: ?>
                            <?php foreach ($latest as $item): ?>
                                <?php
                                    $img = $item['imatge'][0] ?? null;
                                    $imgUrl = $img ? getVoraMediaUrl($img['url']) : '';
                                    $categoria = $item['categoria'] ?? '';
                                    $dataFormatada = formatDate($item['data'] ?? '');
                                    $titul = htmlspecialchars($item['titol'] ?? $item['titul'] ?? '', ENT_QUOTES, 'UTF-8');
                                    $rawDesc = $item['descripcio'] ?? '';
                                    $excerpt = strip_tags($rawDesc);
                                    $excerpt = mb_strlen($excerpt) > 120 ? mb_substr($excerpt, 0, 120) . '...' : $excerpt;
                                    $excerpt = htmlspecialchars($excerpt, ENT_QUOTES, 'UTF-8');
                                ?>
                                <a href="noticia.php?id=<?= $item['id'] ?>" class="news-card">
                                    <div class="news-card-img">
                                        <?php if ($imgUrl): ?>
                                            <img src="<?= htmlspecialchars($imgUrl, ENT_QUOTES, 'UTF-8') ?>" alt="<?= $titul ?>" loading="lazy" width="400" height="250">
                                        <?php else: ?>
                                            <div class="news-card-img-placeholder" style="display:flex;align-items:center;justify-content:center;height:100%;background:rgba(255,255,255,0.03);">
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                            </div>
                                        <?php endif; ?>
                                        <?php if ($categoria): ?>
                                            <span class="news-card-cat"><?= htmlspecialchars($categoria, ENT_QUOTES, 'UTF-8') ?></span>
                                        <?php endif; ?>
                                    </div>
                                    <div class="news-card-body">
                                        <?php if ($dataFormatada): ?>
                                            <span class="news-card-date"><?= htmlspecialchars($dataFormatada, ENT_QUOTES, 'UTF-8') ?></span>
                                        <?php endif; ?>
                                        <h3 class="news-card-title"><?= $titul ?></h3>
                                        <?php if ($excerpt): ?>
                                            <p class="news-card-excerpt"><?= $excerpt ?></p>
                                        <?php endif; ?>
                                    </div>
                                </a>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>

                    <!-- Historical news list -->
                    <div id="news-historical" class="news-grid-inner" style="display: none;">
                        <?php if (empty($historical)): ?>
                            <div class="news-empty">No hi ha notícies històriques actualment.</div>
                        <?php else: ?>
                            <?php foreach ($historical as $item): ?>
                                <?php
                                    $img = $item['imatge'][0] ?? null;
                                    $imgUrl = $img ? getVoraMediaUrl($img['url']) : '';
                                    $categoria = $item['categoria'] ?? '';
                                    $dataFormatada = formatDate($item['data'] ?? '');
                                    $titul = htmlspecialchars($item['titol'] ?? $item['titul'] ?? '', ENT_QUOTES, 'UTF-8');
                                    $excerpt = htmlspecialchars($item['subtitol'] ?? '', ENT_QUOTES, 'UTF-8');
                                ?>
                                <a href="noticia.php?id=<?= $item['id'] ?>" class="news-card">
                                    <div class="news-card-img">
                                        <?php if ($imgUrl): ?>
                                            <img src="<?= htmlspecialchars($imgUrl, ENT_QUOTES, 'UTF-8') ?>" alt="<?= $titul ?>" loading="lazy" width="400" height="250">
                                        <?php else: ?>
                                            <div class="news-card-img-placeholder" style="display:flex;align-items:center;justify-content:center;height:100%;background:rgba(255,255,255,0.03);">
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                            </div>
                                        <?php endif; ?>
                                        <?php if ($categoria): ?>
                                            <span class="news-card-cat"><?= htmlspecialchars($categoria, ENT_QUOTES, 'UTF-8') ?></span>
                                        <?php endif; ?>
                                    </div>
                                    <div class="news-card-body">
                                        <?php if ($dataFormatada): ?>
                                            <span class="news-card-date"><?= htmlspecialchars($dataFormatada, ENT_QUOTES, 'UTF-8') ?></span>
                                        <?php endif; ?>
                                        <h3 class="news-card-title"><?= $titul ?></h3>
                                        <?php if ($excerpt): ?>
                                            <p class="news-card-excerpt"><?= htmlspecialchars(mb_strlen($excerpt) > 95 ? mb_substr($excerpt, 0, 95) . '...' : $excerpt) ?></p>
                                        <?php endif; ?>
                                    </div>
                                </a>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
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

    <script id="ssr-noticias-data" type="application/json">
        <?= json_encode($noticias, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>
    </script>
    <script src="js/script.js"></script>
    <script src="js/noticias.js"></script>
</body>
</html>
