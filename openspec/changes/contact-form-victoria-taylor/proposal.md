# Proposal: Contact Form Backend — Victoria Taylor

## Intent

El formulario de contacto en `html/contacto.html` tiene action `#` y no envía datos a ningún sitio. Los visitantes rellenan nombre, email, mensaje y checkboxes de privacidad/marketing, pero el submit no produce ningún efecto. Esto genera una mala experiencia de usuario y pérdida de leads reales. Necesitamos un backend PHP que procese, valide y envíe los datos por email, siguiendo el patrón probado de Aula Gastronòmica.

## Scope

### In Scope
- `php/token.php` — endpoint GET que devuelve CSRF token + reCAPTCHA site key
- `php/contacte.php` — endpoint POST que procesa: reCAPTCHA v3, rate limiting (10s), CSRF, honeypot, sanitización, mail() nativo
- `.env` — archivo con credenciales reCAPTCHA + destinatario + DEV_SEND_REAL
- `js/contact-form.js` — módulo JS nuevo: fetch a token.php, validación client-side, envío con FormData + fetch, toasts de feedback
- Modificación mínima de `html/contacto.html`: añadir hidden inputs (csrf_token, recaptcha_response, honeypot), cargar `contact-form.js`
- Adaptación del patrón Aula a los campos de VT: sin phone/subject, añadir campo `marketing`

### Out of Scope
- Panel admin para ver contactos (no BD)
- Almacenar contactos en base de datos
- Cambiar el diseño visual o las animaciones GSAP existentes del form
- Modificar las traducciones i18n existentes en script.js
- Sistema de colas de email (solo mail() nativo)

## Capabilities

### New Capabilities
- `contact-form-backend`: Backend PHP para formulario de contacto con CSRF, reCAPTCHA v3, rate limiting, honeypot, sanitización, y envío por mail() nativo, con bypass local para XAMPP.

### Modified Capabilities
- None.

## Approach

Replicar el patrón exacto de Aula Gastronòmica adaptado a los campos de VT:

1. **Frontend** (`js/contact-form.js`): fetch a `php/token.php` → inyecta CSRF + carga reCAPTCHA v3. Submit interceptado con `e.preventDefault()`, validación client-side, recogida de token reCAPTCHA, envío con FormData vía fetch. Toasts visuales de feedback.
2. **Backend token** (`php/token.php`): session_start, loadEnv manual desde `.env`, genera CSRF token (random_bytes), devuelve JSON con csrf_token + recaptcha_site_key.
3. **Backend contacto** (`php/contacte.php`): reCAPTCHA v3 (bypass localhost), rate limiting por sesión (10s), validación CSRF, honeypot, sanitización HTML de name/message, validación email, bypass local si DEV_SEND_REAL=false, mail() con headers seguros.
4. **Adaptación VT**: campos aceptados: name, email, message, privacy (required), marketing (checkbox opcional → se registra en el cuerpo del email). Sin phone/subject.
5. **HTML**: añadir `<input type="hidden" id="csrfToken" name="csrf_token">`, `<input type="hidden" id="recaptchaResponse" name="recaptcha_response">`, y un campo honeypot oculto.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `victoriaTaylor/php/token.php` | New | Endpoint CSRF token + reCAPTCHA key |
| `victoriaTaylor/php/contacte.php` | New | Endpoint procesamiento formulario |
| `victoriaTaylor/.env` | New | Credenciales (reCAPTCHA, destinatario, dev mode) |
| `victoriaTaylor/js/contact-form.js` | New | Lógica JS de envío + validación + toasts |
| `victoriaTaylor/html/contacto.html` | Modified | Añadir hidden inputs + script tag |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| CDMON no soporta sesiones PHP | Low | Verificar antes de subir; alternativa: fallback a token HMAC sin sesión |
| reCAPTCHA v3 cambia API | Low | Cargar desde CDN oficial con URL dinámica desde token.php |
| mail() bloqueado en CDMON | Low | Verificar con hosting; fallback a pipe a SMTP si es necesario |

## Rollback Plan

1. Revertir `html/contacto.html` a su estado anterior (action="#" sin hidden inputs)
2. Eliminar `js/contact-form.js`
3. Eliminar `php/` y `.env`
4. Restaurar backup si se modificó algo más

## Dependencies

- Google reCAPTCHA v3 (claves site + secret) — obtener de google.com/recaptcha/admin
- PHP 7.4+ con session, cURL, mail() habilitados
- CDMON hosting compatible con sesiones PHP

## Success Criteria

- [ ] `php/token.php` devuelve JSON con `csrf_token` y `recaptcha_site_key`
- [ ] Envío local (XAMPP) responde con éxito simulado sin enviar email real
- [ ] reCAPTCHA v3 se verifica en producción, se bypassea en localhost
- [ ] Rate limiting rechaza envíos duplicados antes de 10 segundos
- [ ] CSRF inválido devuelve error JSON
- [ ] Honeypot detecta bots
- [ ] Email real llega al destinatario con campos name, email, message, marketing status
- [ ] Toasts visuales: success (verde) o error (rojo) según respuesta del servidor