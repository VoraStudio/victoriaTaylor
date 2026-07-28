<?php
/* ==========================================================================
   agenda.php — Página SSR del llistat d'events (Victoria Taylor)
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
    $avui = strtotime('today');
    if ($timestamp < $avui) return $dia . ' ' . $mesos[$mes] . ' del ' . $any;
    if (date('Y', $timestamp) === date('Y', $avui)) return $dia . ' ' . $mesos[$mes];
    return $dia . ' ' . $mesos[$mes] . ' del ' . $any;
}

function isUpcoming($dateString) {
    if (!$dateString) return false;
    $timestamp = strtotime($dateString);
    return $timestamp && $timestamp >= strtotime('today');
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
    'path'        => '/agenda',
    'client_ip'   => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
    'user_agent'  => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
]);

/* ─── Ferry dades ─── */
$result = $cms->fetch('/api/public/victoria-taylor/event');
$events = $result['data'] ?? [];

/* ─── Classificar events ─── */
$upcoming = [];
$historical = [];
foreach ($events as $ev) {
    $evDate = $ev['data'] ?? '';
    if (isUpcoming($evDate)) {
        $upcoming[] = $ev;
    } else {
        $historical[] = $ev;
    }
}
?>
<!DOCTYPE html>
<html lang="cat" class="page-html">
<head>
    <script>document.documentElement.classList.add('js-enabled');</script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Pròxims esdeveniments, exposicions i inauguracions. Consulta l'agenda cultural d'art contemporani.">
    <meta name="keywords" content="agenda cultural, esdeveniments art, exposicions, inauguracions, art contemporani Girona">
    <meta name="author" content="Victoria Taylor - Global Brands Europe, SL">

    <meta property="og:type" content="website">
    <meta property="og:url" content="https://victoriataylor.art/agenda.php">
    <meta property="og:title" content="Agenda | Victoria Taylor">
    <meta property="og:description" content="Pròxims esdeveniments, exposicions i inauguracions. Consulta l'agenda cultural d'art contemporani.">
    <meta property="og:image" content="https://victoriataylor.art/img/og-image.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Agenda | Victoria Taylor">
    <meta name="twitter:description" content="Pròxims esdeveniments, exposicions i inauguracions. Consulta l'agenda cultural d'art contemporani.">
    <meta name="twitter:image" content="https://victoriataylor.art/img/og-image.jpg">

    <link rel="canonical" href="https://victoriataylor.art/agenda.php">

    <link rel="icon" type="image/avif" href="img/logo.avif">
    <link rel="apple-touch-icon" href="img/logo.avif">

    <title>Victoria Taylor | Agenda</title>

    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/agenda.css">

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
                    <img src="img/logo.avif" alt="Victoria Taylor Logo" class="header-logo">
                </a>
            </div>
            <nav class="desktop-nav" aria-label="Navegació de sobretaula">
                <ul class="nav-list">
                    <li><a href="html/nosotros.html" class="nav-link" data-i18n="nav.nosotros">Nosotros</a></li>
                    <li><a href="html/artistas.html" class="nav-link" data-i18n="nav.artistas">Artistas</a></li>
                    <li><a href="agenda.php" class="nav-link active" data-i18n="nav.agenda">Agenda</a></li>
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
                    <img src="img/logo.avif" alt="Victoria Taylor Logo" class="header-logo">
                </a>
            </div>
            <ul class="mobile-nav-list">
                <li><a href="html/nosotros.html" class="mobile-link" data-i18n="nav.nosotros">Nosotros</a></li>
                <li><a href="html/artistas.html" class="mobile-link" data-i18n="nav.artistas">Artistas</a></li>
                <li><a href="agenda.php" class="mobile-link active" data-i18n="nav.agenda">Agenda</a></li>
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
        <section class="agenda-hero" aria-label="Agenda d'events">
            <div class="agenda-hero-bg" style="background-image: url('img/slide1.webp');"></div>
            <div class="agenda-hero-overlay"></div>
            <div class="agenda-hero-content">
                <span class="agenda-hero-label">Agenda</span>
                <h1 class="agenda-hero-title" style="visibility:hidden;">Pròxims Events</h1>
                <p class="agenda-hero-subtitle">Descobreix les exposicions, inauguracions i esdeveniments on podràs viure l'art en primera persona.</p>
            </div>

            <div class="agenda-list-wrap">
                <div class="agenda-tabs" role="tablist" aria-label="Filtrar events">
                    <button id="agenda-tab-upcoming" class="agenda-tab is-active" role="tab" aria-selected="true" aria-controls="agenda-list" type="button">
                        Pròxims <span id="agenda-count-upcoming" class="agenda-tab-count">(<?= count($upcoming) ?>)</span>
                    </button>
                    <button id="agenda-tab-historical" class="agenda-tab" role="tab" aria-selected="false" aria-controls="agenda-list" type="button">
                        Històric <span id="agenda-count-historical" class="agenda-tab-count">(<?= count($historical) ?>)</span>
                    </button>
                </div>

                <div id="agenda-list" class="agenda-list" role="tabpanel">
                    <?php if (empty($events)): ?>
                        <div class="agenda-empty">No hi ha events programats actualment.</div>
                    <?php else: ?>
                        <?php if (empty($upcoming)): ?>
                            <div id="agenda-empty-upcoming" class="agenda-empty" style="display:none;">No hi ha pròxims events programats.</div>
                        <?php endif; ?>
                        <?php if (empty($historical)): ?>
                            <div id="agenda-empty-historical" class="agenda-empty" style="display:none;">No hi ha events històrics.</div>
                        <?php endif; ?>
                        <?php foreach ($events as $ev):
                            $evImg = $ev['imatge'][0] ?? null;
                            $evImgUrl = $evImg ? getVoraMediaUrl($evImg['url']) : '';
                            $evDate = formatEventDate($ev['data'] ?? '');
                            $evTitul = htmlspecialchars($ev['titol'] ?? '', ENT_QUOTES, 'UTF-8');
                            $evLocation = htmlspecialchars($ev['ubicacio'] ?? '', ENT_QUOTES, 'UTF-8');
                            $evTime = htmlspecialchars($ev['hora'] ?? '', ENT_QUOTES, 'UTF-8');
                            $evDesc = htmlspecialchars($ev['descripcio_curta'] ?? ($ev['descripcio'] ?? ''), ENT_QUOTES, 'UTF-8');
                            $evDesc = mb_strlen($evDesc) > 120 ? mb_substr($evDesc, 0, 120) . '...' : $evDesc;
                            $category = isUpcoming($ev['data'] ?? '') ? 'upcoming' : 'historical';
                        ?>
                        <a href="evento.php?id=<?= $ev['id'] ?>" class="agenda-card" data-category="<?= $category ?>">
                            <div class="agenda-card-img">
                                <?php if ($evImgUrl): ?>
                                    <img src="<?= htmlspecialchars($evImgUrl, ENT_QUOTES, 'UTF-8') ?>" alt="<?= $evTitul ?>" loading="lazy" width="400" height="250">
                                <?php else: ?>
                                    <div class="news-card-img-placeholder" style="display:flex;align-items:center;justify-content:center;height:100%;background:rgba(255,255,255,0.03);">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                    </div>
                                <?php endif; ?>
                            </div>
                            <div class="agenda-card-body">
                                <?php if ($evDate): ?>
                                    <span class="agenda-card-date"><?= htmlspecialchars($evDate, ENT_QUOTES, 'UTF-8') ?></span>
                                <?php endif; ?>
                                <h3 class="agenda-card-title"><?= $evTitul ?></h3>
                                <div class="agenda-card-meta">
                                    <?php if ($evLocation): ?>
                                        <span class="agenda-card-location"><?= htmlspecialchars($evLocation, ENT_QUOTES, 'UTF-8') ?></span>
                                    <?php endif; ?>
                                    <?php if ($evTime): ?>
                                        <span class="agenda-card-time"><?= htmlspecialchars($evTime, ENT_QUOTES, 'UTF-8') ?></span>
                                    <?php endif; ?>
                                </div>
                                <?php if ($evDesc): ?>
                                    <p class="agenda-card-desc"><?= htmlspecialchars($evDesc, ENT_QUOTES, 'UTF-8') ?></p>
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
                    <li><a href="html/nosotros.html" data-i18n="nav.nosotros">Nosotros</a></li>
                    <li><a href="html/artistas.html" data-i18n="nav.artistas">Artistas</a></li>
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

    <script id="ssr-agenda-data" type="application/json">
        <?= json_encode($events, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>
    </script>
    <script src="js/script.js"></script>
    <script src="js/agenda.js"></script>
</body>
</html>