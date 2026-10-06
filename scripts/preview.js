'use strict';

const express = require('express');
const path = require('node:path');

const app = express();
const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || 5500);
const host = '127.0.0.1';

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('PORT must be an integer between 1 and 65535.');
  process.exit(1);
}

app.disable('x-powered-by');
app.use((_request, response, next) => {
  response.set('X-Content-Type-Options', 'nosniff');
  response.set('Cache-Control', 'no-store');
  next();
});

app.use('/api', (_request, response) => {
  response.status(503).json({
    error: 'Backend unavailable in the frontend preview.',
    message: 'This server previews the portfolio only. Backend API routes require the separate bridge server.',
  });
});

const pages = new Map([
  ['/', 'index.html'],
  ['/index.html', 'index.html'],
  ['/certificate-viewer.html', 'certificate-viewer.html'],
  ['/sw.js', 'sw.js'],
  ['/manifest.json', 'manifest.json'],
]);

for (const [route, filename] of pages) {
  app.get(route, (_request, response) => {
    response.sendFile(path.join(root, filename), { cacheControl: false });
  });
}

// Expose only browser assets; repository configuration and server code stay private.
for (const directory of ['css', 'js', 'assets']) {
  app.use(`/${directory}`, express.static(path.join(root, directory), {
    dotfiles: 'deny',
    index: false,
    redirect: false,
    cacheControl: false,
  }));
}

app.use((_request, response) => {
  response.status(404).type('text').send('Not found');
});

app.use((error, _request, response, _next) => {
  const status = error.status === 403 ? 404 : (error.status || 500);
  response.status(status).type('text').send(status === 404 ? 'Not found' : 'Unable to serve this file');
});

const server = app.listen(port, host, () => {
  console.log(`Portfolio preview: http://${host}:${port}`);
});

server.on('error', (error) => {
  console.error(`Preview could not start: ${error.message}`);
  process.exitCode = 1;
});
