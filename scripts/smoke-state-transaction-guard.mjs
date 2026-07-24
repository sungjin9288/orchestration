import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import fileStoreModule from '../src/runtime/file-store.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const {
  StateConflictError,
  StateLockTimeoutError,
  createFileStore,
} = fileStoreModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot =
  process.env.ORCHESTRATION_STATE_TRANSACTION_TEMP_ROOT ||
  path.join(repoRoot, 'var', 'runtime-state-transaction-smoke');
const keepFixture = process.env.ORCHESTRATION_STATE_TRANSACTION_KEEP_FIXTURE === '1';
const MODE = 'state-transaction-guard-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function listTemporaryStateFiles(runtimeRoot) {
  return fs.existsSync(runtimeRoot)
    ? fs.readdirSync(runtimeRoot).filter((name) => name.startsWith('state.json.tmp-'))
    : [];
}

async function main() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });

  try {
    const runtimeRoot = path.join(tempRoot, 'source');
    const firstStore = createFileStore({ runtimeRoot });
    const secondStore = createFileStore({ runtimeRoot });
    firstStore.reset();
    const firstState = firstStore.loadState();
    const staleState = secondStore.loadState();

    firstState.sequences.project = 1;
    firstStore.saveState(firstState);
    staleState.sequences.task = 1;
    assert.throws(
      () => secondStore.saveState(staleState),
      (error) =>
        error instanceof StateConflictError &&
        error.statusCode === 409 &&
        /changed after it was loaded/.test(error.message),
    );
    const afterConflict = firstStore.loadStateReadonly();
    assert.equal(afterConflict.sequences.project, 1);
    assert.equal(afterConflict.sequences.task, 0);
    assert.equal(fs.existsSync(firstStore.stateLockPath), false);
    assert.deepEqual(listTemporaryStateFiles(runtimeRoot), []);

    const lockedStore = createFileStore({
      runtimeRoot,
      stateLockTimeoutMs: 25,
      stateLockRetryMs: 5,
      stateStaleLockMs: 1,
    });
    const lockedState = lockedStore.loadState();
    fs.writeFileSync(
      lockedStore.stateLockPath,
      `${JSON.stringify({ pid: process.pid, createdAt: '1970-01-01T00:00:00.000Z' })}\n`,
      { flag: 'wx', mode: 0o600 },
    );
    lockedState.sequences.run = 1;
    assert.throws(
      () => lockedStore.saveState(lockedState),
      (error) =>
        error instanceof StateLockTimeoutError &&
        error.statusCode === 409 &&
        /Timed out/.test(error.message),
    );
    assert.equal(fs.existsSync(lockedStore.stateLockPath), true);
    fs.unlinkSync(lockedStore.stateLockPath);
    assert.equal(lockedStore.loadStateReadonly().sequences.run, 0);

    const recoverableState = lockedStore.loadState();
    fs.writeFileSync(
      lockedStore.stateLockPath,
      `${JSON.stringify({ pid: 999_999_999, createdAt: '1970-01-01T00:00:00.000Z' })}\n`,
      { flag: 'wx', mode: 0o600 },
    );
    recoverableState.sequences.artifact = 1;
    lockedStore.saveState(recoverableState);
    assert.equal(lockedStore.loadStateReadonly().sequences.artifact, 1);
    assert.equal(fs.existsSync(lockedStore.stateLockPath), false);
    assert.deepEqual(listTemporaryStateFiles(runtimeRoot), []);

    const symlinkRoot = path.join(tempRoot, 'symlink');
    const outsideRoot = path.join(tempRoot, 'outside');
    fs.mkdirSync(symlinkRoot, { recursive: true });
    fs.mkdirSync(outsideRoot, { recursive: true });
    const sourceStatePath = firstStore.statePath;
    const outsideStatePath = path.join(outsideRoot, 'state.json');
    fs.copyFileSync(sourceStatePath, outsideStatePath);
    fs.symlinkSync(outsideStatePath, path.join(symlinkRoot, 'state.json'));
    assert.throws(
      () => createFileStore({ runtimeRoot: symlinkRoot }).loadState(),
      /state file must be a regular file/,
    );

    const finalBytes = fs.readFileSync(firstStore.statePath, 'utf8');
    assert.doesNotThrow(() => JSON.parse(finalBytes));
    assert.equal(JSON.parse(finalBytes).schemaVersion, 19);

    console.log(
      JSON.stringify(
        {
          ok: true,
          mode: MODE,
          schemaVersion: 19,
          staleWriterRejected: true,
          lostUpdatePrevented: true,
          activeLockTimedOut: true,
          deadOwnerLockRecovered: true,
          symlinkStateRejected: true,
          temporaryFilesCleaned: true,
        },
        null,
        2,
      ),
    );
  } finally {
    if (!keepFixture) {
      fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
