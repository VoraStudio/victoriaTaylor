# Design: Contact Form Backend — Victoria Taylor

## Architecture Overview

```
┌─────────────┐     fetch()      ┌──────────────────┐
│  Browser     │ ──────────────> │  php/token.php    │
│  (contacto   │ <────────────── │  GET → JSON       │
│   .html)     │   csrf_token +  │  {csrf, recaptcha}│
│              │   site_key      └──────────────────┘
│              │
│  User fills  │     fetch()      ┌──────────────────┐
│  form +      │ ──────────────> │  php/contacte.php │
│  clicks      │   POST FormData │  POST → JSON      │
│  submit      │ <────────────── │  {ok, message}    │
│              │   JSON response └──────────────────┘
└──────────────┘
```

## File Structure

### 1. `php/token.php` (new)

**Propósito**: Endpoint GET que inicia sesión PHP, lee credenciales de `.env`, y devuelve CSRF token + reCAPTCHA site key.

**Flujo**:
1. `session_start()`
2. `loadEnv()` manual desde `.env` (mismo patrón que Aula — sin Dotenv/Composer)
3. Si no existe `$_SESSION['csrf_token']` → `bin2hex(random_bytes(32))`
4. Leer `RECAPTCHA_SITE_KEY` del `.env`
5. Responder JSON: `{ csrf_token: "...", recaptcha_site_key: "..." }`

### 2. `php/contacte.php` (new)

**Propósito**: Endpoint POST que procesa el formulario con todas las validaciones de seguridad y envía el email.

**Flujo**:
1. `session_start()`, `header('Content-Type: application/json')`
2. `loadEnv()` desde `.env`
3. **reCAPTCHA v3** (solo si no es localhost): POST a Google siteverify con cURL o file_get_contents
4. **Rate limiting**: check `$_SESSION['last_submit_time']` — mínimo 10s entre envíos
5. **CSRF**: validar `$_POST['csrf_token']` contra `$_SESSION['csrf_token']`
6. **Honeypot**: si `$_POST['honeypot']` no está vacío → responder éxito ficticio (el bot cree que envió)
7. **Sanitización**:
   - `name` → `htmlspecialchars(trim($_POST['name']))`
   - `email` → `filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL)` + `FILTER_VALIDATE_EMAIL`
   - `message` → `htmlspecialchars(trim($_POST['message']))`
   - `marketing` → comprobar si existe en $_POST
8. **Bypass local**: si `$_SERVER['HTTP_HOST']` es localhost/127.0.0.1 y `DEV_SEND_REAL !== 'true'` → responder éxito simulado
9. **Construir email**: texto plano con todos los campos
10. **`mail()`**: enviar a `info@victoriataylor.art` con headers seguros
11. Responder JSON: `{ ok: true, message: "..." }` o `{ ok: false, error: "..." }`

**Campos aceptados**: name, email, message, privacy, marketing, csrf_token, recaptcha_response, honeypot

### 3. `.env` (new)

Formato:
```
SMTP_USER=info@victoriataylor.art
RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET=
DEV_SEND_REAL=false
```

- Añadir al `.gitignore`
- `loadEnv()` parsea líneas `CLAVE=VALOR`, ignora comentarios `#` y líneas vacías

### 4. `js/contact-form.js` (new)

**Propósito**: Módulo JS que gestiona el envío asíncrono del formulario con validación, seguridad y toasts.

**Estructura**:

```
initContactForm()
├── initSecurity() → fetch(/php/token.php) → inyecta CSRF + carga reCAPTCHA
├── setupFormHandler()
│   ├── validateForm() → validación client-side con resaltado visual
│   ├── sendFormData() → fetch POST a /php/contacte.php con FormData
│   └── Toast system → showToast(type, title, message)
```

**Validación client-side**:
- name: no vacío
- email: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- message: no vacío
- privacy: checkbox checked
- Error visual: `classList.add('form-input--error')` con borde rojo

**Toast system**:
- Posición: **bottom-right** (similar a Aula, pero adaptado al diseño VT)
- Estilo visual coherente con VT:
  - Tipografía: `Plus Jakarta Sans` (body) / `Syne` (título)
  - Fondo: `var(--color-cream)` para success, `var(--color-wine)` para error
  - Texto: `var(--color-black)` sobre cream, `var(--color-white)` sobre wine
  - Borde izquierdo: `var(--color-wine)` 4px en success, `var(--color-mauve)` en error
  - Sombra sutil, border-radius: 4px
  - Animación: GSAP desde derecha (slide in + fade)
  - Auto-dismiss: 6 segundos con barra de progreso
  - Cierre manual con botón X

**Integración con el HTML existente**:
- No modifica las animaciones GSAP existentes del contacto (`contactTl`)
- Se ejecuta en `DOMContentLoaded` después de que las animaciones de entrada ya se dispararon
- No interfiere con el sistema i18n existente (los textos del form ya están traducidos)

### 5. `html/contacto.html` (modified)

Cambios mínimos:
1. `<form id="contact-form" action="javascript:void(0);" method="POST">` → ya tiene `id="contact-form"` y `action="#"`, cambiar action
2. Añadir hidden inputs dentro del form (antes del primer campo visible):
   ```html
   <input type="hidden" name="csrf_token" id="csrfToken" value="">
   <input type="hidden" name="recaptcha_response" id="recaptchaResponse" value="">
   ```
3. Añadir honeypot (oculto visualmente, no con `type="hidden"` para no activar autocomplete):
   ```html
   <div style="display:none" aria-hidden="true">
     <input type="text" name="honeypot" tabindex="-1" autocomplete="off">
   </div>
   ```
4. Añadir `<script src="../js/contact-form.js"></script>` antes del cierre de `</body>`

## Toast Design Spec

| Property | Success | Error |
|----------|---------|-------|
| Background | `#F5ECE5` (cream) | `#722F37` (wine) |
| Text color | `#000000` | `#FFFFFF` |
| Border-left | 4px solid `#722F37` | 4px solid `#DEBCB0` |
| Icon | ✓ checkmark | ✕ cross |
| Font title | Syne 700 | Syne 700 |
| Font message | Plus Jakarta Sans 400 | Plus Jakarta Sans 400 |
| Shadow | `0 4px 20px rgba(0,0,0,0.15)` | `0 4px 20px rgba(0,0,0,0.15)` |
| Border-radius | 4px | 4px |
| Position | fixed, bottom: 24px, right: 24px | fixed, bottom: 24px, right: 24px |
| Animation | GSAP: x:100 → 0, opacity:0 → 1 | GSAP: x:100 → 0, opacity:0 → 1 |
| Duration visible | 6s auto-dismiss | 6s auto-dismiss |
| Progress bar | `#722F37` | `#DEBCB0` |

## Error Handling Matrix

| Capa | Error | Respuesta |
|------|-------|-----------|
| JS | Red caída | Toast "Error de connexió amb el servidor" |
| JS | reCAPTCHA fails | Enviar igualmente (PHP valida) |
| PHP | CSRF inválido | JSON `{ok:false, error:"Validació CSRF fallida"}` |
| PHP | Rate limit | JSON `{ok:false, error:"Espera X segons"}` |
| PHP | Honeypot detectado | JSON `{ok:true}` (simular éxito para no alertar bots) |
| PHP | reCAPTCHA fails | JSON `{ok:false, error:"Verificació de seguretat fallida"}` |
| PHP | mail() falla | JSON `{ok:false, error:"Error al enviar el missatge"}` |
| PHP | .env no encontrado | JSON `{ok:false, error:"Error de configuració del servidor"}` |

## Dependencies

- PHP 7.4+ con: session, cURL (para reCAPTCHA), mail()
- Google reCAPTCHA v3 keys (site + secret)
- CDMON hosting compatible con sesiones PHP

## Non-Goals (repeated from spec)

- No se almacenan contactos en BD
- No hay panel admin para ver mensajes
- No cambia el diseño visual del formulario
- No se modifican las animaciones GSAP existentes
- No se tocan las traducciones i18n