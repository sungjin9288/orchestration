import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const serveUiPath = path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'serve-ui-args-'));
const runtimeRoot = path.join(tempRoot, 'runtime');

function runServeWithArgs(args) {
  const child = spawn(process.execPath, [serveUiPath, ...args], {
    cwd: repoRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (chunk) => {
    stdout += chunk.toString('utf8');
  });
  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString('utf8');
  });

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`serve-ui did not fail closed for args: ${args.join(' ')}`));
    }, 1000);

    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });

    child.on('exit', (status, signal) => {
      clearTimeout(timer);
      resolve({
        status,
        signal,
        stdout,
        stderr,
      });
    });
  });
}

const unknownFlagResult = await runServeWithArgs([
  '--runtime-rooot',
  runtimeRoot,
  '--port',
  '4329',
]);

assert.equal(unknownFlagResult.status, 2, 'unknown serve-ui flags must fail before server start');
assert.equal(unknownFlagResult.signal, null);

const unknownFlagPayload = JSON.parse(unknownFlagResult.stderr);
assert.equal(unknownFlagPayload.ok, false);
assert.equal(unknownFlagPayload.mode, 'serve-ui-argument-error');
assert.equal(unknownFlagPayload.error, 'invalid-arguments');
assert.match(unknownFlagPayload.message, /Unknown argument: --runtime-rooot/);
assert.deepEqual(unknownFlagPayload.allowedFlags, ['--host', '--port', '--runtime-root']);

const missingValueResult = await runServeWithArgs(['--runtime-root', '--port', '4329']);
assert.equal(missingValueResult.status, 2, 'missing option values must fail before server start');

const missingValuePayload = JSON.parse(missingValueResult.stderr);
assert.equal(missingValuePayload.ok, false);
assert.equal(missingValuePayload.error, 'invalid-arguments');
assert.match(missingValuePayload.message, /--runtime-root requires a value/);

const positionalResult = await runServeWithArgs(['unexpected-positional']);
assert.equal(positionalResult.status, 2, 'unexpected positional args must fail before server start');

const positionalPayload = JSON.parse(positionalResult.stderr);
assert.equal(positionalPayload.ok, false);
assert.equal(positionalPayload.error, 'invalid-arguments');
assert.match(positionalPayload.message, /Unexpected positional argument: unexpected-positional/);

const serveUi = fs.readFileSync(serveUiPath, 'utf8');
assert.match(serveUi, /Unknown argument: \${arg}/);
assert.match(serveUi, /serve-ui-argument-error/);
assert.match(serveUi, /allowedFlags: \['--host', '--port', '--runtime-root'\]/);

console.log(
  JSON.stringify(
    {
      ok: true,
      serveUiArgumentGuard: {
        unknownFlagStatus: unknownFlagResult.status,
        missingValueStatus: missingValueResult.status,
        positionalStatus: positionalResult.status,
        allowedFlags: unknownFlagPayload.allowedFlags,
      },
    },
    null,
    2,
  ),
);
