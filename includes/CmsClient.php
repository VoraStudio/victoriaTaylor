<?php

/* ══════════════════════════════════════════════════════════════
   CmsClient — Client cURL per al CMS VoraCMS
   ══════════════════════════════════════════════════════════════
   Gestiona l'obtenció de JWT, cache en fitxer (5 min TTL),
   i peticions GET/POST amb reintent automàtic en cas de 401.

   Requereix l'extensió curl de PHP. No usa file_get_contents
   ni proc_open (compatible amb CDMON).
   ══════════════════════════════════════════════════════════════ */

class CmsClient
{
    private string $cmsUrl;
    private string $origin;
    private string $cacheFile;
    private int $cacheTtl;

    public function __construct(
        string $cmsUrl,
        string $origin,
        int $cacheTtl = 300,
        ?string $cacheDir = null,
    ) {
        $this->cmsUrl = rtrim($cmsUrl, '/');
        $this->origin = $origin;
        $this->cacheFile = ($cacheDir ?? sys_get_temp_dir()) . '/aulacms_jwt_' . md5(__DIR__);
        $this->cacheTtl = $cacheTtl;
    }

    /* ─── Obté el token (cache o API) ─── */
    public function getToken(): ?string
    {
        $token = $this->getCachedToken();
        if ($token !== null) {
            return $token;
        }

        return $this->fetchTokenFromApi();
    }

    /* ─── GET amb Authorization + Origin ─── */
    public function fetch(string $path): ?array
    {
        $token = $this->getToken();
        if ($token === null) {
            return null;
        }

        $url = $this->cmsUrl . $path;
        $result = $this->curlGet($url, $token);
        $statusCode = $result['http_code'] ?? 0;

        if ($statusCode === 401 || $statusCode === 403) {
            $this->clearCache();
            $token = $this->getToken();
            if ($token === null) {
                return null;
            }
            $result = $this->curlGet($url, $token);
        }

        if (($result['http_code'] ?? 0) >= 400) {
            return null;
        }

        return json_decode($result['body'] ?? '', true);
    }

    /* ─── POST amb Authorization + Origin ─── */
    public function post(string $path, array $body): bool
    {
        $token = $this->getToken();
        if ($token === null) {
            return false;
        }

        $url = $this->cmsUrl . $path;
        $result = $this->curlPost($url, $token, $body);
        $statusCode = $result['http_code'] ?? 0;

        if ($statusCode === 401 || $statusCode === 403) {
            $this->clearCache();
            $token = $this->getToken();
            if ($token === null) {
                return false;
            }
            $result = $this->curlPost($url, $token, $body);
        }

        return ($result['http_code'] ?? 0) < 400;
    }

    /* ─── Cache del token en fitxer ─── */
    private function getCachedToken(): ?string
    {
        if (!file_exists($this->cacheFile)) {
            return null;
        }

        $mtime = filemtime($this->cacheFile);
        if ($mtime === false || (time() - $mtime) > $this->cacheTtl) {
            @unlink($this->cacheFile);
            return null;
        }

        $token = @file_get_contents($this->cacheFile);
        if ($token === false || trim($token) === '') {
            return null;
        }

        return trim($token);
    }

    private function saveTokenToCache(string $token): void
    {
        @file_put_contents($this->cacheFile, $token, LOCK_EX);
    }

    private function clearCache(): void
    {
        @unlink($this->cacheFile);
    }

    /* ─── Obtenció del token des de l'API ─── */
    private function fetchTokenFromApi(): ?string
    {
        $url = $this->cmsUrl . '/api/public/token';

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_HTTPHEADER => [
                'Origin: ' . $this->origin,
            ],
        ]);

        $body = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || $body === false) {
            return null;
        }

        $data = json_decode($body, true);
        $token = $data['token'] ?? null;

        if ($token !== null) {
            $this->saveTokenToCache($token);
        }

        return $token;
    }

    /* ─── cURL GET ─── */
    private function curlGet(string $url, string $token): array
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $token,
                'Origin: ' . $this->origin,
            ],
        ]);

        $body = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return [
            'body' => $body,
            'http_code' => $httpCode,
        ];
    }

    /* ─── cURL POST ─── */
    private function curlPost(string $url, string $token, array $data): array
    {
        $jsonBody = json_encode($data);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $jsonBody,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $token,
                'Origin: ' . $this->origin,
            ],
        ]);

        $body = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return [
            'body' => $body,
            'http_code' => $httpCode,
        ];
    }
}
