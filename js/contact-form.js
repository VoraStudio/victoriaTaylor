/* ===========================================================
   contact-form.js — Formulari de contacte (Victoria Taylor)
   ===========================================================
   Gestiona l'enviament asíncron del formulari de contacte:
   - Obtenció de CSRF token + reCAPTCHA via token.php
   - Validació client-side amb resaltat visual
   - Enviament per fetch a contacte.php
   - Toasts de feedback visual amb disseny VT
   =========================================================== */

(function () {
  /* ─── CONFIG ─── */
  /* Rutes relatives desde html/contacto.html cap a php/ */
  var TOKEN_URL = '../php/token.php';
  var CONTACT_URL = '../php/contacte.php';

  /* ─── INICI ─── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
  } else {
    initContactForm();
  }

  /* ─── FUNCIÓ PRINCIPAL ─── */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    initSecurity(form);
    setupFormHandler(form);
  }

  /* ─── SEGURETAT (CSRF + reCAPTCHA) ─── */
  function initSecurity(form) {
    fetch(TOKEN_URL)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var csrfInput = document.getElementById('csrfToken');
        if (csrfInput && data.csrf_token) {
          csrfInput.value = data.csrf_token;
        }

        if (data.recaptcha_site_key) {
          var script = document.createElement('script');
          script.src = 'https://www.google.com/recaptcha/api.js?render=' + data.recaptcha_site_key;
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
        }
      })
      .catch(function (err) {
        console.warn('No s\'ha pogut obtenir el token de seguretat:', err);
      });
  }

  /* ─── VALIDACIÓ CLIENT-SIDE ─── */
  function clearErrors(form) {
    form.querySelectorAll('.form-input--error').forEach(function (el) {
      el.classList.remove('form-input--error');
    });
    form.querySelectorAll('.form-checkbox--error').forEach(function (el) {
      el.classList.remove('form-checkbox--error');
    });
  }

  function markError(el) {
    if (el.type === 'checkbox') {
      el.classList.add('form-checkbox--error');
    } else {
      el.classList.add('form-input--error');
    }
  }

  function validateForm(form) {
    clearErrors(form);

    var name = form.querySelector('#name');
    var email = form.querySelector('#email');
    var message = form.querySelector('#message');
    var privacy = form.querySelector('input[name="privacy"]');

    if (!name.value.trim()) { markError(name); name.focus(); return false; }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { markError(email); email.focus(); return false; }
    if (!message.value.trim()) { markError(message); message.focus(); return false; }
    if (!privacy.checked) { markError(privacy); privacy.focus(); return false; }

    return true;
  }

  /* ─── NETEGAR ERRORS EN ESCRIURE ─── */
  function setupClearErrors(form) {
    form.querySelectorAll('input, textarea').forEach(function (el) {
      el.addEventListener('input', function () {
        el.classList.remove('form-input--error');
      });
    });
    var privacy = form.querySelector('input[name="privacy"]');
    if (privacy) {
      privacy.addEventListener('change', function () {
        privacy.classList.remove('form-checkbox--error');
      });
    }
  }

  /* ─── MANEJADOR D'ENVIAMENT ─── */
  function setupFormHandler(form) {
    var feedback = form.querySelector('.contact-form-feedback');
    var submitBtn = form.querySelector('.submit-btn');

    setupClearErrors(form);

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!validateForm(form)) return;

      submitBtn.setAttribute('disabled', 'true');
      var originalText = submitBtn.textContent;
      submitBtn.textContent = 'ENVIANT...';

      function sendFormData() {
        var formData = new FormData(form);

        fetch(CONTACT_URL, {
          method: 'POST',
          body: formData
        })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          submitBtn.removeAttribute('disabled');
          submitBtn.textContent = originalText;

          if (data.ok) {
            form.reset();
            showToast(
              'Missatge enviat',
              data.message || 'Gràcies pel teu missatge! Ens posarem en contacte aviat.',
              'success'
            );
          } else {
            showToast(
              'Error en el formulari',
              data.error || "S'ha produït un error al processar el formulari.",
              'error'
            );
          }
        })
        .catch(function (err) {
          console.error('Error enviant el formulari:', err);
          submitBtn.removeAttribute('disabled');
          submitBtn.textContent = originalText;
          showToast(
            'Error de connexió',
            'Error de connexió amb el servidor. Torna-ho a provar.',
            'error'
          );
        });
      }

      /* reCAPTCHA v3 */
      if (typeof grecaptcha !== 'undefined') {
        var script = document.querySelector('script[src*="recaptcha/api.js?render="]');
        var siteKey = '';
        if (script) {
          var match = script.src.match(/render=([^&]+)/);
          if (match) siteKey = match[1];
        }

        if (siteKey) {
          grecaptcha.ready(function () {
            grecaptcha.execute(siteKey, { action: 'submit_contact' })
              .then(function (token) {
                var recaptchaInput = document.getElementById('recaptchaResponse');
                if (recaptchaInput) recaptchaInput.value = token;
                sendFormData();
              })
              .catch(function () {
                sendFormData();
              });
          });
        } else {
          sendFormData();
        }
      } else {
        sendFormData();
      }
    });
  }

  /* ─── SISTEMA DE TOASTS ─── */
  function showToast(title, message, type) {
    var container = document.querySelector('.vt-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'vt-toast-container';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }

    var toast = document.createElement('div');
    toast.className = 'vt-toast vt-toast--' + type;

    var iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    }

    toast.innerHTML =
      '<div class="vt-toast__icon">' + iconSvg + '</div>' +
      '<div class="vt-toast__content">' +
        '<div class="vt-toast__title">' + title + '</div>' +
        '<div class="vt-toast__message">' + message + '</div>' +
      '</div>' +
      '<button class="vt-toast__close" aria-label="Tancar">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
      '</button>' +
      '<div class="vt-toast__progress"></div>';

    container.appendChild(toast);

    /* Animació d'entrada amb GSAP */
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(toast,
        { x: 100, opacity: 0, scale: 0.9 },
        { x: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.2)' }
      );
    }

    var progress = toast.querySelector('.vt-toast__progress');
    var duration = 6000;

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(progress,
        { scaleX: 1 },
        { scaleX: 0, duration: duration / 1000, ease: 'none' }
      );
    }

    var timeoutId = setTimeout(function () { dismissToast(toast); }, duration);

    /* Pausar en hover */
    toast.addEventListener('mouseenter', function () {
      clearTimeout(timeoutId);
      if (typeof gsap !== 'undefined') {
        gsap.getTweensOf(progress).forEach(function (t) { t.pause(); });
      }
    });

    toast.addEventListener('mouseleave', function () {
      if (typeof gsap !== 'undefined') {
        gsap.getTweensOf(progress).forEach(function (t) { t.play(); });
      }
      timeoutId = setTimeout(function () { dismissToast(toast); }, 3000);
    });

    /* Botó tancar */
    toast.querySelector('.vt-toast__close').addEventListener('click', function () {
      dismissToast(toast);
    });
  }

  function dismissToast(toast) {
    if (typeof gsap !== 'undefined') {
      gsap.getTweensOf(toast).forEach(function (t) { t.kill(); });
      gsap.getTweensOf(toast.querySelector('.vt-toast__progress')).forEach(function (t) { t.kill(); });
      gsap.to(toast, {
        x: 100,
        opacity: 0,
        scale: 0.9,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: function () { toast.remove(); }
      });
    } else {
      toast.remove();
    }
  }
})();