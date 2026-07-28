# Tasks: Contact Form Backend — Victoria Taylor

## T1: Crear `.env` y sistema de carga de variables

**Archivos**: `.env` (new), `php/contacte.php`, `php/token.php`

**Qué hacer**:
1. Crear `.env` en raíz con estructura:
   ```
   SMTP_USER=info@victoriataylor.art
   RECAPTCHA_SITE_KEY=
   RECAPTCHA_SECRET=
   DEV_SEND_REAL=false
   ```
2. Añadir `.env` al `.gitignore`
3. Incluir función `loadEnv()` en ambos PHP (parseo manual de `CLAVE=VALOR`, soporte comentarios `#`)
4. Llamar `loadEnv(dirname(__DIR__) . '/.env')` al inicio de token.php y contacte.php

**QA**: Ejecutar `php -l php/token.php` y `php -l php/contacte.php` — sin errores sintácticos.

---

## T2: Crear `php/token.php`

**Archivo**: `php/token.php` (new)

**Qué hacer**:
1. `session_start()`, `error_reporting(0)`, `header('Content-Type: application/json')`
2. Cargar `.env` con `loadEnv()`
3. Generar CSRF token si no existe: `bin2hex(random_bytes(32))`
4. Leer `RECAPTCHA_SITE_KEY` del entorno
5. Responder JSON: `{ csrf_token: "...", recaptcha_site_key: "..." }`

**QA**: `php -l php/token.php` + test manual: `php -r "\$_SERVER['HTTP_HOST']='localhost'; include 'php/token.php';"` debe devolver JSON.

---

## T3: Crear `php/contacte.php`

**Archivo**: `php/contacte.php` (new)

**Qué hacer**:
1. `session_start()`, `error_reporting(0)`, `header('Content-Type: application/json')`
2. Cargar `.env`
3. **reCAPTCHA**: si no es localhost y existe RECAPTCHA_SECRET, verificar con Google siteverify (cURL preferente, file_get_contents fallback)
4. **Rate limiting**: 10s entre envíos por sesión
5. **CSRF**: validar contra sesión
6. **Honeypot**: si no está vacío, responder `{ok: true}` (simular éxito)
7. **Sanitizar**: name y message con htmlspecialchars, email con filter_var
8. **Bypass local**: en XAMPP responder éxito simulado
9. **Construir email**: formato texto plano, cuerpo con name, email, message, marketing
10. **mail()**: enviar con From + Reply-To seguros, charset UTF-8
11. Responder JSON éxito o error

**QA**: `php -l php/contacte.php`

---

## T4: Crear `js/contact-form.js`

**Archivo**: `js/contact-form.js` (new)

**Qué hacer**:
1. `initContactForm()` llamada en `DOMContentLoaded`
2. **`initSecurity()`**: `fetch('../php/token.php')` → inyecta CSRF en `#csrfToken`, carga reCAPTCHA v3 si hay site key
3. **`validateForm()`**: name no vacío, email regex, message no vacío, privacy checked
4. **`setupFormHandler()`**: intercepta submit, valida, obtiene reCAPTCHA token, envía con `fetch()` + FormData a `../php/contacte.php`
5. **Toast system**:
   - Posición: `fixed; bottom: 24px; right: 24px; z-index: 9999`
   - Success: fondo `#F5ECE5`, texto negro, borde izquierdo `#722F37`
   - Error: fondo `#722F37`, texto blanco, borde izquierdo `#DEBCB0`
   - Tipografía: título Syne 700, cuerpo Plus Jakarta Sans 400
   - Animación GSAP: slide desde derecha
   - Auto-dismiss 6s con barra de progreso + botón cerrar

**QA**: No rompe animaciones GSAP existentes del contacto (líneas 638-679 de script.js).

---

## T5: Modificar `html/contacto.html`

**Archivo**: `html/contacto.html` (modified)

**Qué hacer**:
1. Cambiar `<form action="#"` → `<form action="javascript:void(0);"`
2. Añadir dentro del form (antes de `.form-group` de name):
   ```html
   <input type="hidden" name="csrf_token" id="csrfToken" value="">
   <input type="hidden" name="recaptcha_response" id="recaptchaResponse" value="">
   <div style="display:none" aria-hidden="true">
     <input type="text" name="honeypot" tabindex="-1" autocomplete="off">
   </div>
   ```
3. Añadir antes de `</body>`: `<script src="../js/contact-form.js"></script>`

**QA**: HTML válido, no se rompen las animaciones GSAP.

---

## Review Workload Forecast

- **Archivos nuevos**: 4 (.env, token.php, contacte.php, contact-form.js)
- **Archivos modificados**: 1 (contacto.html)
- **Archivos tocados**: 5
- **Líneas estimadas**: ~250 nuevas + ~10 modificadas ≈ 260 líneas
- **400-line budget risk**: Low (~260 líneas)
- **Chained PRs recommended**: No
- **Decision needed before apply**: No