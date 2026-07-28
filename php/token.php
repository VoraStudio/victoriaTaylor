<?php
session_start();
error_reporting(0);
header('Content-Type: application/json');

/* ==========================================================================
   token.php — CSRF token + reCAPTCHA site key (Victoria Taylor)
   ==========================================================================
   Endpoint GET usat pel frontend per obtenir el token CSRF i la clau pública
   de reCAPTCHA abans d'enviar el formulari de contacte.
   ========================================================================== */

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

$env = loadEnv(dirname(__DIR__) . '/.env');

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

$recaptcha_site_key = $env['RECAPTCHA_SITE_KEY'] ?? '';

echo json_encode([
    'csrf_token'         => $_SESSION['csrf_token'],
    'recaptcha_site_key' => $recaptcha_site_key
]);