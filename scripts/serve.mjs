// Static server for dist/ — local preview and production (Railway).
// Usage: node scripts/serve.mjs [--draft] [--watch] [--no-build]
// Production (NODE_ENV=production or on Railway): www -> apex 301, HTTPS redirect,
// legacy URL redirects, security + cache headers, gzip, noindex on non-canonical hosts.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { watch } from 'node:fs';
import { spawn } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../src/config.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT) || 4173;
const args = process.argv.slice(2);
const PROD = process.env.NODE_ENV === 'production' || Boolean(process.env.RAILWAY_ENVIRONMENT);
const CANONICAL = new URL(config.siteUrl);

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
};
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.json', '.webmanifest', '.xml', '.txt', '.svg']);
const LONG_CACHE = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico']);

const REDIRECTS = {
  '/en': '/', '/en/': '/', '/en.html': '/', '/index.html': '/',
  '/es.html': '/es/', '/fr.html': '/fr/', '/ru.html': '/ru/',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

const runBuild = () => new Promise((resolve) => {
  const buildArgs = args.includes('--draft') ? ['--draft'] : [];
  spawn(process.execPath, [path.join(ROOT, 'scripts', 'build.mjs'), ...buildArgs], { stdio: 'inherit' })
    .on('exit', resolve);
});

if (!args.includes('--no-build')) await runBuild();

if (args.includes('--watch')) {
  let timer;
  const trigger = () => { clearTimeout(timer); timer = setTimeout(runBuild, 150); };
  for (const dir of ['src', 'public']) watch(path.join(ROOT, dir), { recursive: true }, trigger);
  console.log('Watching src/ and public/ for changes…');
}

const isFile = async (p) => { try { return (await stat(p)).isFile(); } catch { return false; } };
const isDir = async (p) => { try { return (await stat(p)).isDirectory(); } catch { return false; } };
const gzCache = new Map();

function redirect(res, location) {
  res.writeHead(301, { Location: location, 'Cache-Control': 'public, max-age=3600', ...SECURITY_HEADERS });
  res.end();
}

http.createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    const url = new URL(req.url, 'http://localhost');
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(':')[0].toLowerCase();
    const proto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
    const isCanonicalHost = host === CANONICAL.hostname;

    if (PROD) {
      if (host === `www.${CANONICAL.hostname}` || (isCanonicalHost && proto === 'http')) {
        return redirect(res, `${CANONICAL.origin}${url.pathname}${url.search}`);
      }
    }

    let pathname;
    try { pathname = decodeURIComponent(url.pathname); } catch { res.writeHead(400).end(); return; }
    if (REDIRECTS[pathname]) return redirect(res, REDIRECTS[pathname] + url.search);
    if (pathname.endsWith('/index.html')) return redirect(res, pathname.slice(0, -'index.html'.length) + url.search);

    let file = path.resolve(DIST, '.' + pathname);
    if (file !== DIST && !file.startsWith(DIST + path.sep)) { res.writeHead(403).end(); return; }
    if (!pathname.endsWith('/') && await isDir(file)) return redirect(res, pathname + '/' + url.search);
    if (pathname.endsWith('/')) file = path.join(file, 'index.html');

    let status = 200;
    const hidden = path.basename(file).startsWith('.') || path.basename(file).startsWith('_');
    if (hidden || !await isFile(file)) { file = path.join(DIST, '404.html'); status = 404; }

    const ext = path.extname(file);
    const headers = { 'Content-Type': TYPES[ext] || 'application/octet-stream', ...SECURITY_HEADERS };
    if (!PROD) headers['Cache-Control'] = 'no-store';
    else headers['Cache-Control'] = LONG_CACHE.has(ext) ? 'public, max-age=2592000' : 'public, max-age=0, must-revalidate';
    if (PROD && isCanonicalHost) headers['Strict-Transport-Security'] = 'max-age=31536000';
    if (PROD && !isCanonicalHost) headers['X-Robots-Tag'] = 'noindex';

    let body = await readFile(file);
    if (COMPRESSIBLE.has(ext)) {
      headers.Vary = 'Accept-Encoding';
      if (/\bgzip\b/.test(req.headers['accept-encoding'] || '') && body.length > 1024) {
        const key = file;
        if (!PROD || !gzCache.has(key)) gzCache.set(key, gzipSync(body));
        body = gzCache.get(key);
        headers['Content-Encoding'] = 'gzip';
      }
    }
    headers['Content-Length'] = body.length;
    res.writeHead(status, headers);
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.writeHead(500);
    res.end();
  }
}).listen(PORT, () => console.log(`\nMy DR Taxi ${PROD ? 'production' : 'preview'} server listening on port ${PORT}`));
