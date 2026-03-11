import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import contractsModule from '../src/runtime/contracts.js';
import fileStoreModule from '../src/runtime/file-store.js';

const { createEmptyState } = contractsModule;
const { createFileStore } = fileStoreModule;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const uiRoot = path.join(repoRoot, 'ui');

function parseArgs(argv) {
  const options = {
    host: '127.0.0.1',
    port: 4310,
    runtimeRoot: path.join(repoRoot, 'var', 'runtime'),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--host' && next) {
      options.host = next;
      index += 1;
    } else if (arg === '--port' && next) {
      options.port = Number(next);
      index += 1;
    } else if (arg === '--runtime-root' && next) {
      options.runtimeRoot = path.resolve(repoRoot, next);
      index += 1;
    }
  }

  if (!Number.isInteger(options.port) || options.port <= 0) {
    throw new Error(`Invalid port: ${options.port}`);
  }

  return options;
}

const options = parseArgs(process.argv.slice(2));
const store = createFileStore({ runtimeRoot: options.runtimeRoot });

function json(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function text(response, statusCode, body, contentType) {
  response.writeHead(statusCode, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
  });
  response.end(body);
}

function readSnapshotReadonly() {
  if (!existsSync(store.statePath)) {
    return createEmptyState();
  }

  return store.loadState();
}

async function serveStaticAsset(response, assetPath) {
  const filePath = path.join(uiRoot, assetPath);

  if (!filePath.startsWith(uiRoot)) {
    text(response, 403, 'Forbidden', 'text/plain; charset=utf-8');
    return;
  }

  try {
    const body = await readFile(filePath);
    const extension = path.extname(filePath);
    const contentType =
      extension === '.css'
        ? 'text/css; charset=utf-8'
        : extension === '.js'
          ? 'text/javascript; charset=utf-8'
          : 'text/html; charset=utf-8';

    text(response, 200, body, contentType);
  } catch (error) {
    text(response, 404, 'Not Found', 'text/plain; charset=utf-8');
  }
}

function getRunLogsPayload(runId) {
  const snapshot = readSnapshotReadonly();
  const run = snapshot.runs[runId];

  if (!run) {
    return null;
  }

  return {
    runtimeRoot: options.runtimeRoot,
    run,
    logs: store.readLogRecords(runId),
  };
}

function getArtifactPayload(artifactId) {
  const snapshot = readSnapshotReadonly();
  const artifact = snapshot.artifacts[artifactId];

  if (!artifact) {
    return null;
  }

  const filename = path.basename(artifact.path);

  return {
    runtimeRoot: options.runtimeRoot,
    artifact: {
      ...artifact,
      content: store.readArtifact(filename),
    },
  };
}

const server = createServer(async (request, response) => {
  const method = request.method || 'GET';
  const url = new URL(request.url || '/', `http://${request.headers.host || '127.0.0.1'}`);

  if (method !== 'GET') {
    text(response, 405, 'Method Not Allowed', 'text/plain; charset=utf-8');
    return;
  }

  if (url.pathname === '/api/snapshot') {
    json(response, 200, {
      generatedAt: new Date().toISOString(),
      runtimeRoot: options.runtimeRoot,
      snapshot: readSnapshotReadonly(),
    });
    return;
  }

  const runMatch = url.pathname.match(/^\/api\/runs\/([^/]+)\/logs$/);

  if (runMatch) {
    const payload = getRunLogsPayload(decodeURIComponent(runMatch[1]));

    if (!payload) {
      json(response, 404, { error: 'Run not found' });
      return;
    }

    json(response, 200, payload);
    return;
  }

  const artifactMatch = url.pathname.match(/^\/api\/artifacts\/([^/]+)$/);

  if (artifactMatch) {
    const payload = getArtifactPayload(decodeURIComponent(artifactMatch[1]));

    if (!payload) {
      json(response, 404, { error: 'Artifact not found' });
      return;
    }

    json(response, 200, payload);
    return;
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    await serveStaticAsset(response, 'index.html');
    return;
  }

  if (url.pathname === '/styles.css') {
    await serveStaticAsset(response, 'styles.css');
    return;
  }

  if (url.pathname === '/app.js') {
    await serveStaticAsset(response, 'app.js');
    return;
  }

  text(response, 404, 'Not Found', 'text/plain; charset=utf-8');
});

server.listen(options.port, options.host, () => {
  console.log(
    `ui-slice-01 listening on http://${options.host}:${options.port} (runtime root: ${options.runtimeRoot})`,
  );
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
