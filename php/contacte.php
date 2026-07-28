<?php
session_start();
error_reporting(0);
header('Content-Type: application/json');

/* ==========================================================================
   contacte.php — Formulari de contacte (Victoria Taylor)
   ==========================================================================
   Processa el formulari de contacte amb:
   - reCAPTCHA v3 (producció)
   - Rate limiting (10s per sessió)
   - CSRF validation
   - Honeypot anti-spam
   - Sanitització de camps
   - Enviament per mail() natiu
   - Bypass local per a XAMPP
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

// --- DETECCIÓ ENTORN ---
$host = $_SERVER['HTTP_HOST'] ?? '';
$is_localhost = $host === 'localhost' || $host === '127.0.0.1' || str_starts_with($host, 'localhost:') || str_starts_with($host, '127.0.0.1:');

// --- DESTINATARI ---
$destinatari = $env['SMTP_USER'] ?? 'pau@vorastudio.cat';
// TODO: Cambiar a info@victoriataylor.art antes de subir a producción
$asunto_web = 'Nou missatge des de Victoria Taylor';

// --- 1. RECAPTCHA v3 (només en producció) ---
if (!$is_localhost) {
    $recaptcha_secret = $env['RECAPTCHA_SECRET'] ?? '';
    if ($recaptcha_secret) {
        $recaptcha_response = $_POST['recaptcha_response'] ?? '';
        $url = 'https://www.google.com/recaptcha/api/siteverify';
        $data = [
            'secret'   => $recaptcha_secret,
            'response' => $recaptcha_response
        ];

        $response = false;
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            $response = curl_exec($ch);
            $curl_error = curl_error($ch);
            curl_close($ch);
            if ($response === false) {
                error_log("VT reCAPTCHA cURL error: $curl_error");
            }
        }
        if ($response === false) {
            $options = [
                'http' => [
                    'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                    'method'  => 'POST',
                    'content' => http_build_query($data)
                ],
                'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
            ];
            $context = stream_context_create($options);
            $response = @file_get_contents($url, false, $context);
        }

        if ($response === false) {
            echo json_encode(['ok' => false, 'error' => 'Error de verificació de seguretat. Torna-ho a provar.']);
            exit;
        }

        $response_keys = json_decode($response, true);
        if (!$response_keys["success"]) {
            echo json_encode(['ok' => false, 'error' => 'La verificació de seguretat ha fallat.']);
            exit;
        }
    }
}

// --- 2. RATE LIMITING (Sessió) ---
$temps_espera = 10;
if (isset($_SESSION['last_submit_time'])) {
    $temps_transcorregut = time() - $_SESSION['last_submit_time'];
    if ($temps_transcorregut < $temps_espera) {
        $restant = $temps_espera - $temps_transcorregut;
        echo json_encode(['ok' => false, 'error' => "Has d'esperar $restant segons abans d'enviar un altre missatge."]);
        exit;
    }
}

// --- 3. CSRF VALIDATION ---
if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
    echo json_encode(['ok' => false, 'error' => 'Validació de seguretat (CSRF) fallida.']);
    exit;
}

// --- 4. HONEYPOT ---
if (!empty($_POST['honeypot'])) {
    // Silenci: el bot creu que ha enviat, però no fem res
    echo json_encode(['ok' => true, 'message' => 'Missatge enviat correctament!']);
    exit;
}

// --- 5. SANEJAMENT DE DADES ---
$nombre   = htmlspecialchars(trim($_POST['name'] ?? 'Sense nom'));
$email    = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$mensaje  = htmlspecialchars(trim($_POST['message'] ?? 'Sense missatge'));
$marketing = isset($_POST['marketing']) ? 'Sí' : 'No';

// --- 6. VALIDACIÓ DE CAMPS CRÍTICS ---
if (empty($nombre) || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($mensaje)) {
    echo json_encode(['ok' => false, 'error' => 'Si us plau, omple tots els camps obligatoris correctament.']);
    exit;
}

// --- 7. BYPASS LOCAL (XAMPP) ---
$dev_send_real = !empty($env['DEV_SEND_REAL']) && $env['DEV_SEND_REAL'] === 'true';
if ($is_localhost && !$dev_send_real) {
    $_SESSION['last_submit_time'] = time();
    echo json_encode(['ok' => true, 'message' => 'Missatge enviat correctament! (Mode local de proves)']);
    exit;
}

// --- 8. CONSTRUCCIÓ DEL COS DEL CORREU ---
$contenido = "Has rebut un nou missatge des del formulari de contacte de Victoria Taylor:\n\n";
$contenido .= "Nom complet: $nombre\n";
$contenido .= "Email: $email\n";
$contenido .= "Màrqueting: $marketing\n\n";
$contenido .= "Missatge:\n$mensaje\n";

// --- 9. CAPÇALERES SEGURES ---
$headers = "From: info@victoriataylor.art\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "Content-type: text/plain; charset=UTF-8\r\n";

// --- 10. ENVIAMENT ---
if (@mail($destinatari, $asunto_web, $contenido, $headers)) {
    $_SESSION['last_submit_time'] = time();
    echo json_encode(['ok' => true, 'message' => 'Missatge enviat correctament! Ens posarem en contacte amb tu molt aviat.']);
} else {
    echo json_encode(['ok' => false, 'error' => "El missatge no s'ha pogut enviar. Torna-ho a provar més tard."]);
}