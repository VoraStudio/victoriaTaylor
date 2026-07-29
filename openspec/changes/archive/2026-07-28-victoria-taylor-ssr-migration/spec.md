# SDD Spec: Migración SSR Victoria Taylor — Fase 1: Noticias

## Resumen ejecutivo

Migrar la sección de noticias de Victoria Taylor de HTML+JS estático con fetch directo al CMS, a PHP con SSR (Server-Side Rendering). El backend PHP gestiona autenticación JWT, cacheo y tracking de métricas. El frontend JS se reduce exclusivamente a animaciones GSAP.

## Requisitos funcionales

### RF1: Endpoint PHP de noticias
- `php/noticias.php?action=list` — devuelve JSON con listado de noticias desde VoraCMS
- `php/noticias.php?action=view&id={id}` — devuelve JSON con detalle de una noticia + tracking de vista
- Cada llamada registra métrica: endpoint, action, item_id, timestamp, IP, user_agent

### RF2: Página listado de noticias (SSR)
- `noticias.php` renderiza server-side el grid de noticias
- Cada card enlaza a `noticia.php?id={id}`
- Datos embedidos como JSON en `<script id="ssr-noticias-data" type="application/json">`
- Fallback con datos mock si el CMS no responde
- Animación de entrada con GSAP (stagger en cards)

### RF3: Página detalle de noticia (SSR)
- `noticia.php?id={id}` renderiza server-side el detalle completo
- Hero con imagen destacada, título, fecha, categoría
- Cuerpo de texto con descripción en HTML
- Botón de volver al listado
- Tracking de vista individual (ping desde JS al cargar)

### RF4: JS limpio (solo animaciones)
- Eliminar `getCMSData()` y `getVoraMediaUrl()` de `js/noticias.js`
- JS lee datos de `<script id="ssr-noticias-data">`
- Solo animaciones GSAP: stagger de cards, hero entrance, scroll animations

### RF5: i18n
- PHP renderiza idioma por defecto (ca)
- Selector de idioma en JS traduce textos visibles al cambiar
- Fechas en formato locale

## Requisitos técnicos

### RT1: CmsClient.php
- JWT preflight: GET `/api/public/token` con header `Origin`
- Cache de token en archivo (TTL 5 minutos)
- Reintento automático en 401/403
- Header `Origin` en todas las peticiones
- Compatible con PHP 7.4+ (sin Composer, sin librerías externas)
- Ubicación: `includes/CmsClient.php`

### RT2: .env
- `CMS_URL` — URL base del CMS
- `SSR_ORIGIN` — origin para cabecera JWT
- El token hardcodeado de `js/cms.js` se elimina

### RT3: Estructura de archivos
```
victoriaTaylor/
├── .env                          # +CMS_URL, SSR_ORIGIN
├── includes/
│   └── CmsClient.php             # NUEVO
├── php/
│   └── noticias.php              # NUEVO — endpoint
├── noticias.php                  # NUEVO — listado SSR
├── noticia.php                   # NUEVO — detalle SSR
├── js/
│   ├── cms.js                    → ELIMINAR
│   ├── noticias.js               → LIMPIAR (solo animaciones)
├── html/
│   ├── noticias.html             → ELIMINAR
│   └── noticia.html              → ELIMINAR
```

### RT4: Datos mock (fallback)
- 3-4 noticias de ejemplo con todos los campos
- Imágenes de placeholder (Pexels o locale)
- Se muestran cuando el CMS no responde o hay error

## Escenarios

### Happy path
1. Usuario accede a `noticias.php`
2. PHP obtiene JWT de VoraCMS (preflight)
3. PHP fetches listado de noticias
4. PHP renderiza HTML con datos + mock data embedida
5. JS anima las cards con GSAP
6. Usuario hace clic en una card → `noticia.php?id=5`
7. PHP fetches detalle + trackea vista
8. JS anima entrada del detalle

### Edge cases
- **CMS caído**: PHP usa mock data, página se ve completa, sin errores
- **ID inválido**: `noticia.php?id=999` — muestra mensaje "Noticia no encontrada" + enlace a volver
- **Sin noticias**: El grid muestra mensaje "No hay noticias disponibles"
- **Token expirado**: CmsClient refresca automáticamente
- **Error de red**: PHP captura excepción, loggea, usa mock data

## Criterios de aceptación

1. ✅ `noticias.php` carga sin errores aunque el CMS esté caído
2. ✅ `noticia.php?id=5` muestra el detalle correcto
3. ✅ Las cards del listado enlazan a `noticia.php?id=X`
4. ✅ JS no hace ningún fetch directo al CMS
5. ✅ Las animaciones GSAP funcionan en listado y detalle
6. ✅ El token JWT se obtiene y renueva automáticamente
7. ✅ Las métricas se registran en listado y vista individual
8. ✅ Las URLs son PHP directas (sin rewrite)
9. ✅ No queda ningún `var` en los JS modificados (solo `const`/`let`)

## Dependencias

- `includes/CmsClient.php` debe existir antes que cualquier página PHP
- `.env` debe tener `CMS_URL` y `SSR_ORIGIN` configurados
- VoraCMS debe tener el endpoint `/api/public/token` operativo

## Riesgos

- **Medio**: Si VoraCMS cambia el endpoint de token, todas las páginas SSR fallan
- **Bajo**: Las imágenes mock de Pexels pueden caducar
- **Bajo**: El cache de 5 min del JWT puede dar error si el token expira antes