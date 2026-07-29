<?php
/* ══════════════════════════════════════════════════════════════
   helpers.php — Funcions auxiliars per a pàgines SSR
   ══════════════════════════════════════════════════════════════ */

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

function getVoraMediaUrl($path) {
    if (!$path) return '';
    if (strpos($path, 'http') === 0) return $path;
    return $GLOBALS['cmsUrl'] . $path;
}

function slugify($text) {
    $map = [
        'á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u',
        'à'=>'a','è'=>'e','ì'=>'i','ò'=>'o','ù'=>'u',
        'ñ'=>'n','ü'=>'u','Á'=>'a','É'=>'e','Í'=>'i','Ó'=>'o','Ú'=>'u',
        'À'=>'a','È'=>'e','Ì'=>'i','Ò'=>'o','Ù'=>'u','Ñ'=>'n','Ü'=>'u'
    ];
    $t = mb_strtolower($text, 'UTF-8');
    $t = strtr($t, $map);
    $t = preg_replace('/[^a-z0-9]+/', '-', $t);
    return trim($t, '-');
}

function toLang($value) {
    return ['es' => $value, 'ca' => $value, 'en' => $value];
}