# SDD Design: Migración SSR Victoria Taylor — Fase 1: Noticias

## Arquitectura general

```
[ Browser ] ←→ noticias.php / noticia.php (SSR)
                       ↓
              includes/CmsClient.php (JWT preflight)
                       ↓
              VoraCMS (Symfony API)
```

**Flujo SSR (listado):**
```
1. noticias.php
2.   ├─ require CmsClient.php + loadEnv()
3.   ├─ session_start()
4.   ├─ $cms = new CmsClient(CMS_URL, SSR_ORIGIN)
5.   │    └─ GET /api/public/token (Origin: SSR_ORIGIN) → JWT (cache 5min)
6.   ├─ $cms->post('/api/visit', { path, ip, user_agent }) → tracking
7.   ├─ $cms->fetch('/api/public/victoria-taylor/noticia') → datos
8.   ├─ Fallback: mock data si CMS no responde
9.   └─ Render HTML + <script id="ssr-noticias-data">JSON</script>
```

**Flujo SSR (detalle):**
```
1. noticia.php?id=5
2.   ├─ Mismo boot (CmsClient + token + visit)
3.   ├─ $cms->fetch("/api/public/victoria-taylor/noticia/5")
4.   ├─ Fallback: detalle mock
5.   └─ Render HTML + <script id="ssr-noticia-data">JSON</script>
```

**Flujo JS (animación):**
```
1. noticias.js
2.   ├─ Lee #ssr-noticias-data → parse JSON
3.   └─ GSAP stagger cards + ScrollTrigger
```

## Estructura de archivos

```
victoriaTaylor/
├── .env                                    # MODIFICAR: +CMS_URL, SSR_ORIGIN
├── includes/
│   └── CmsClient.php                       # NUEVO — desde aulagastronomica
├── php/
│   └── noticias.php                        # NUEVO — endpoint JSON
├── noticias.php                            # NUEVO — listado SSR
├── noticia.php                             # NUEVO — detalle SSR
├── js/
│   ├── cms.js                              → ELIMINAR
│   └── noticias.js                         → LIMPIAR (solo GSAP)
├── html/
│   ├── noticias.html                       → ELIMINAR
│   └── noticia.html                        → ELIMINAR
```

## Especificación técnica por archivo

### 1. includes/CmsClient.php

Copia literal de `aulaGastronomica/includes/CmsClient.php` (208 líneas). Sin cambios.

### 2. .env

```env
# Connexió CMS (VoraCMS via SSR)
CMS_URL=https://voracms.voradata.cat
SSR_ORIGIN=https://victoriatalaylor.com

# Formulari de contacte (existente)
SMTP_USER=...
RECAPTCHA_SITE_KEY=...
RECAPTCHA_SECRET=...
DEV_SEND_REAL=false
```

### 3. php/noticias.php (endpoint)

```php
<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../includes/CmsClient.php';

// loadEnv
$env = loadEnv(__DIR__ . '/../.env');
$cmsUrl = $env['CMS_URL'] ?? 'https://voracms.voradata.cat';
$origin = $env['SSR_ORIGIN'] ?? 'https://victoriatalaylor.com';

$cms = new CmsClient($cmsUrl, $origin);
$action = $_GET['action'] ?? 'list';
$id = $_GET['id'] ?? null;

// Tracking: guardar métrica
$metric = [
    'endpoint' => 'noticias',
    'action' => $action,
    'item_id' => $action === 'view' ? $id : null,
    'timestamp' => date('c'),
    'ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
];
// Persistir métrica (log file)
$logDir = __DIR__ . '/../var/log';
if (!is_dir($logDir)) mkdir($logDir, 0755, true);
file_put_contents(
    $logDir . '/metrics.jsonl',
    json_encode($metric) . "\n",
    FILE_APPEND | LOCK_EX
);

switch ($action) {
    case 'list':
        $result = $cms->fetch('/api/public/victoria-taylor/noticia');
        echo json_encode($result ?? ['data' => []]);
        break;
    case 'view':
        if (!$id) { echo json_encode(['error' => 'ID requerido']); exit; }
        $result = $cms->fetch("/api/public/victoria-taylor/noticia/{$id}");
        echo json_encode($result ?? ['error' => 'Noticia no encontrada']);
        break;
    default:
        echo json_encode(['error' => 'Acción no válida']);
}
```

### 4. noticias.php (SSR listado)

Estructura:
- PHP boot al inicio (antes de DOCTYPE)
- Header + hero
- Grid de cards renderizado con PHP
- Cada card: `<a href="noticia.php?id=X" class="news-card">`
- `<script id="ssr-noticias-data" type="application/json">` con todas las noticias
- Footer
- JS: `js/lang.js` + `js/noticias.js` (solo animación)

Mock data (fallback): 4 noticias realistas de galería.

### 5. noticia.php (SSR detalle)

Estructura:
- PHP boot al inicio (antes de DOCTYPE)
- Header
- Hero con imagen destacada y datos
- Contenido: descripción, galería
- Botón volver: `<a href="noticias.php">← Todas las noticias</a>`
- `<script id="ssr-noticia-data" type="application/json">` con la noticia
- Footer
- JS: Tracking ping + animación

### 6. js/noticias.js (limpiar)

Eliminar:
- Toda la función `openNewsModal()` y su contenido
- `loadNoticias()` con `getCMSData()`
- Lightbox y galería dinámica
- Event listeners del modal

Nuevo contenido:
```javascript
/* ----- INICI ANIMACIÓ LLISTAT NOTÍCIES (SSR) ----- */
function initSsrNoticias() {
  var dataScript = document.getElementById('ssr-noticias-data');
  if (!dataScript) return;

  const cards = document.querySelectorAll('.news-card');
  if (!cards.length) return;

  cards.forEach((card, index) => {
    gsap.fromTo(card,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2 + index * 0.15,
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });
}
```

Nota: cambiar `var` por `const`/`let` según regla global.

### 7. Archivos a eliminar
- `js/cms.js` — toda la lógica CMS migrada a PHP
- `html/noticias.html` — reemplazado por `noticias.php`
- `html/noticia.html` — reemplazado por `noticia.php`

## Mock data (fallback noticias)

```php
$mockNoticias = [
    [
        'id' => 1,
        'titul' => 'Nova exposició: "Horitzons" de Marta Riera',
        'subtitol' => 'Una col·lecció d\'obres que exploren els límits entre abstracció i paisatge',
        'descripcio' => '<p>Victoria Taylor Gallery presenta la nova exposició individual de Marta Riera, "Horitzons". Una mostra que recull 15 obres inèdites creades entre 2025 i 2026.</p><p>L\'exposició estarà oberta al públic del 15 de setembre al 30 de novembre.</p>',
        'data' => '2026-09-10T12:00:00Z',
        'categoria' => 'Exposició',
        'imatge' => [['url' => 'https://images.pexels.com/photos/2790294/pexels-photo-2790294.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2']],
    ],
    [
        'id' => 2,
        'titul' => 'Taller d\'art contemporani per a joves',
        'subtitol' => 'Inscripcions obertes per a l\'edició de tardor',
        'descripcio' => '<p>El programa educatiu de Victoria Taylor Gallery obre inscripcions per al taller d\'art contemporani adreçat a joves de 14 a 18 anys.</p><p>Les sessions tindran lloc cada dissabte d\'octubre a desembre.</p>',
        'data' => '2026-08-20T10:00:00Z',
        'categoria' => 'Taller',
        'imatge' => [['url' => 'https://images.pexels.com/photos/542556/pexels-photo-542556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2']],
    ],
    [
        'id' => 3,
        'titul' => 'El fons permanent s\'amplia amb 5 noves adquisicions',
        'subtitol' => 'Peces d\'artistes emergents catalans s\'incorporen a la col·lecció',
        'descripcio' => '<p>La galeria anuncia l\'adquisició de 5 noves obres que passaran a formar part del fons permanent. Artistes com Pau Costa, Laia Soler i Marc Vidal s\'incorporen al catàleg.</p>',
        'data' => '2026-07-15T09:00:00Z',
        'categoria' => 'Col·lecció',
        'imatge' => [['url' => 'https://images.pexels.com/photos/3029682/pexels-photo-3029682.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2']],
    ],
    [
        'id' => 4,
        'titul' => 'Entrevista a l\'artista convidat: Jordi Vilanova',
        'subtitol' => 'Parlem amb l\'artista sobre el seu procés creatiu i la seva nova sèrie',
        'descripcio' => '<p>Jordi Vilanova, artista resident del mes, ens obre les portes del seu taller i parla sobre "Essències", la seva nova sèrie d\'obres que es podrà veure a la galeria a partir de l\'1 d\'octubre.</p>',
        'data' => '2026-06-28T11:00:00Z',
        'categoria' => 'Entrevista',
        'imatge' => [['url' => 'https://images.pexels.com/photos/3014882/pexels-photo-3014882.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2']],
    ],
];
```

## Plan de implementación

1. Crear `includes/CmsClient.php` (copia de aulagastronomica)
2. Crear `.env` con nuevas vars
3. Crear `php/noticias.php` (endpoint)
4. Crear `noticias.php` (SSR listado)
5. Crear `noticia.php` (SSR detalle)
6. Limpiar `js/noticias.js` (solo GSAP)
7. Eliminar `js/cms.js`, `html/noticias.html`, `html/noticia.html`
8. Probar: levantar servidor PHP, verificar listado y detalle

## Variables de entorno necesarias

| Variable | Descripción | Default |
|---|---|---|
| CMS_URL | URL base del VoraCMS | https://voracms.voradata.cat |
| SSR_ORIGIN | Origin para header JWT | https://victoriatalaylor.com |