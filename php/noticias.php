<?php
session_start();
header('Content-Type: application/json');

/* ==========================================================================
   noticias.php — Endpoint JSON per a notícies (Victoria Taylor)
   ==========================================================================
   Accions disponibles:
   - action=list     → Retorna el llistat de notícies
   - action=view&id=X → Retorna una notícia individual
   Tracking: registra mètriques a var/log/metrics.jsonl
   ========================================================================== */

require_once __DIR__ . '/../includes/CmsClient.php';

/* ─── loadEnv: Carrega variables d'entorn des de .env ─── */
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

/* ─── Boot: carregar .env + inicialitzar CmsClient ─── */
$env = loadEnv(__DIR__ . '/../.env');
$cmsUrl = $env['CMS_URL'] ?? 'https://voracms.voradata.cat';
$origin = $env['SSR_ORIGIN'] ?? 'https://victoriataylor.com';

$cms = new CmsClient($cmsUrl, $origin);

/* ─── Paràmetres de la request ─── */
$action = $_GET['action'] ?? 'list';
$id = $_GET['id'] ?? null;

/* ─── Tracking: registrar mètrica a var/log/metrics.jsonl ─── */
$logDir = __DIR__ . '/../var/log';
if (!is_dir($logDir)) {
    @mkdir($logDir, 0755, true);
}

$metric = [
    'endpoint'   => 'noticias',
    'action'     => $action,
    'item_id'    => ($action === 'view' && $id) ? $id : null,
    'timestamp'  => date('c'),
    'ip'         => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
];

$logLine = json_encode($metric, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n";
@file_put_contents($logDir . '/metrics.jsonl', $logLine, FILE_APPEND | LOCK_EX);

/* ─── Routing ─── */
if ($action === 'list') {
    $result = $cms->fetch('/api/public/victoria-taylor/noticia');

    if ($result === null || !isset($result['data'])) {
        http_response_code(200);
        echo json_encode(['data' => []], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    echo json_encode(['data' => $result['data']], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($action === 'view' && $id) {
    $result = $cms->fetch("/api/public/victoria-taylor/noticia/{$id}");

    if ($result === null || !isset($result['data'])) {
        http_response_code(404);
        echo json_encode(['error' => 'Noticia no encontrada'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    echo json_encode(['data' => $result['data']], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Acció no vàlida
http_response_code(400);
echo json_encode(['error' => 'Acció no vàlida'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
