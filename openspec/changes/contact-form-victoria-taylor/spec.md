# Spec: Contact Form Backend — Victoria Taylor

## Functional Requirements

| ID | Description | Priority |
|----|-------------|----------|
| RF-01 | `php/token.php` devuelve JSON con `csrf_token` (string) y `recaptcha_site_key` (string) vía GET | High |
| RF-02 | `php/contacte.php` acepta POST con FormData y procesa el envío | High |
| RF-03 | Rate limiting: máximo 1 envío cada 10 segundos por sesión PHP | High |
| RF-04 | Validación CSRF: el campo `csrf_token` debe coincidir con el de la sesión | High |
| RF-05 | Honeypot: campo oculto `honeypot`; si tiene contenido, se rechaza silenciosamente | High |
| RF-06 | reCAPTCHA v3: verificar token con Google en producción; bypassear en localhost | Medium |
| RF-07 | Sanitización: `htmlspecialchars()` en name y message; `filter_var(FILTER_VALIDATE_EMAIL)` en email | High |
| RF-08 | Envío por `mail()` nativo a `info@victoriataylor.art` con Reply-To del remitente | High |
| RF-09 | Bypass local: en XAMPP (localhost o 127.0.0.1) simular envío sin mail real | High |
| RF-10 | JS: envío asíncrono con `fetch()` + FormData, sin recarga de página | High |
| RF-11 | Toasts de feedback visual coherentes con el diseño de Victoria Taylor | Medium |

## Campos del formulario

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| name | text | sí | no vacío, htmlspecialchars |
| email | email | sí | email válido (FILTER_VALIDATE_EMAIL) |
| message | textarea | sí | no vacío, htmlspecialchars |
| privacy | checkbox | sí | debe estar marcado |
| marketing | checkbox | no | opcional |

## Seguridad

- CSRF token: `bin2hex(random_bytes(32))` por sesión
- Honeypot: campo oculto con `display:none` + `tabindex="-1"` + `autocomplete="off"`
- reCAPTCHA v3: siteverify a `https://www.google.com/recaptcha/api/siteverify`
- Rate limiting: `$_SESSION['last_submit_time']` con 10 segundos de espera
- Headers email: `From: info@victoriataylor.art`, `Reply-To: email del usuario`, `Content-type: text/plain; charset=UTF-8`

## Escenarios

### E-01: Envío feliz
Usuario rellena todos los campos, marca privacidad, envía → toast success "Missatge enviat correctament! Ens posarem en contacte amb tu molt aviat."

### E-02: Campos incompletos
Usuario deja name, email o message vacíos → error visual en el campo (borde rojo) + focus. No se envía.

### E-03: Email inválido
Usuario escribe email sin formato válido → error visual en campo email. No se envía.

### E-04: Privacidad sin marcar
Usuario no marca el checkbox de privacidad → error visual en el checkbox. No se envía.

### E-05: Error de servidor
PHP falla o no responde → toast error: "Error de connexió amb el servidor. Torna-ho a provar."

### E-06: CSRF inválido
Token CSRF modificado o expirado → toast error: "Validació de seguretat (CSRF) fallida."

### E-07: Rate limiting
Usuario envía dos veces en menos de 10 segundos → toast: "Has d'esperar X segons abans d'enviar un altre missatge."

### E-08: Spam (honeypot)
Bot rellena el campo honeypot → PHP rechaza silenciosamente (no hay respuesta visible).

### E-09: Localhost
Entorno XAMPP → PHP responde con éxito simulado sin enviar email real. Toast success pero con indicación de modo pruebas.

### E-10: Marketing opcional
Usuario marca o no el checkbox marketing → se refleja en el cuerpo del email como "Màrqueting: Sí/No".

## Criterios de aceptación

- [ ] El formulario envía datos sin recargar la página
- [ ] El usuario ve un toast de éxito o error inmediatamente después del envío
- [ ] Los toasts usan la tipografía y colores de Victoria Taylor (Syne / Plus Jakarta Sans)
- [ ] Las credenciales (reCAPTCHA, email) viven en `.env`, nunca en el código
- [ ] El email llega a `info@victoriataylor.art` con el contenido completo y Reply-To correcto
- [ ] En localhost (XAMPP) funciona sin enviar emails reales
- [ ] Un bot no puede enviar spam (honeypot + reCAPTCHA + rate limiting)
- [ ] El código PHP no usa Composer ni librerías externas

## Formato del email

```
Has rebut un nou missatge des del formulari de contacte de Victoria Taylor:

Nom complet: {name}
Email: {email}
Màrqueting: {Sí/No}

Missatge:
{message}
```