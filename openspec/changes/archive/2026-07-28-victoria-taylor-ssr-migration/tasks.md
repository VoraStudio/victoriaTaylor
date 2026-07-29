# Tasks: Migración SSR Victoria Taylor — Fase 1: Noticias

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~600 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Foundation + Endpoint) → PR 2 (SSR páginas + JS + Cleanup) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation (.env + CmsClient) + Endpoint JSON | PR 1 | Base de toda la migración. Autónomo, reviewable, testable |
| 2 | SSR páginas + JS cleanup + archivos obsoletos | PR 2 | Depende de PR 1. Contiene la mayor parte del cambio de UX |

---

## Fase 1: Foundation

- [x] **1.1** Añadir `CMS_URL` y `SSR_ORIGIN` al `.env` raíz con valores por defecto. Crear directorio `includes/` y `var/log/`.
- [x] **1.2** Copiar `includes/CmsClient.php` desde `aulaGastronomica/includes/CmsClient.php` a `victoriaTaylor/includes/CmsClient.php`. Sin cambios.

## Fase 2: Endpoint JSON

- [x] **2.1** Crear `php/noticias.php` con `action=list` (fetch listado CMS) y `action=view&id=X` (fetch detalle + tracking). Usar `loadEnv()` (ya existe en `contacte.php`). Persistir métricas en `var/log/metrics.jsonl`. Fallback a JSON vacío si CMS no responde.

## Fase 3: Páginas SSR

- [x] **3.1** Crear `noticias.php` (listado SSR): PHP boot con CmsClient + session_start + tracking de visita. Renderizar HTML con header + hero + grid de cards (`<a href="noticia.php?id=X" class="news-card">`). Embedir JSON de datos en `<script id="ssr-noticias-data" type="application/json">`. Incluir mock data de 4 noticias como fallback si CMS no responde. Cargar `js/lang.js`, `js/script.js`, `js/noticias.js`.
- [x] **3.2** Crear `noticia.php` (detalle SSR): PHP boot con CmsClient + fetch detalle por `$_GET['id']`. Renderizar hero con imagen destacada + categoría + título + fecha. Cuerpo con descripción HTML. Botón volver a `noticias.php`. Embedir JSON en `<script id="ssr-noticia-data" type="application/json">`. Cargar `js/lang.js`, `js/script.js`, `js/noticia.js`.

## Fase 4: JavaScript (solo animaciones)

- [x] **4.1** Limpiar `js/noticias.js`: eliminar `loadNoticias()`, `openNewsModal()`, lightbox, todos los `var` y listeners de modal. Escribir `initSsrNoticias()` que lee `#ssr-noticias-data` y anima las `.news-card` con GSAP stagger + ScrollTrigger. Solo `const`/`let`.
- [x] **4.2** Limpiar `js/noticia.js`: eliminar `loadNoticia()` con `getCMSData()`. Escribir función que lee `#ssr-noticia-data`, renderiza hero/título/fecha desde el JSON embedido, anima entrada con GSAP, y hace un fetch POST a `php/noticias.php?action=view&id=X` para tracking de vista individual (ping).

## Fase 5: Cleanup

- [x] **5.1** Eliminar `js/cms.js`, `html/noticias.html` y `html/noticia.html`. Verificar que ninguna página restante referencia estos archivos.
