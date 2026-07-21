import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import memoryItemModule from '../src/runtime/memory-items.js';
import recallModule from '../src/runtime/memory-recall-preview.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { computeMemoryItemRecordDigest } = memoryItemModule;
const {
  BLOCKED_ACTIONS,
  NON_APPLICATION_STATEMENT,
  RECALL_ACKNOWLEDGEMENT,
} = recallModule;
const { createRuntimeService } = runtimeModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot =
  process.env.ORCHESTRATION_MEMORY_RECALL_TEMP_ROOT ||
  path.join(repoRoot, 'var', 'runtime-ai-company-memory-recall-preview-smoke');
const keepFixture = process.env.ORCHESTRATION_MEMORY_RECALL_KEEP_FIXTURE === '1';
const seedOnly = process.env.ORCHESTRATION_MEMORY_RECALL_SEED_ONLY === '1';
const MODE = 'ai-company-memory-recall-preview-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function listStatePaths(directory) {
  const paths = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...listStatePaths(entryPath));
    if (entry.isFile() && entry.name === 'state.json') paths.push(entryPath);
  }
  return paths;
}

function seedStoredMemoryItem() {
  const seeded = spawnSync(
    process.execPath,
    ['scripts/smoke-ai-company-durable-memory-item.mjs'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCHESTRATION_DURABLE_MEMORY_ITEM_KEEP_FIXTURE: '1',
        ORCHESTRATION_DURABLE_MEMORY_ITEM_TEMP_ROOT: tempRoot,
      },
    },
  );
  if (seeded.status !== 0) {
    throw new Error(seeded.stderr || seeded.stdout || 'Failed to seed MemoryItem');
  }
  for (const statePath of listStatePaths(tempRoot)) {
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    const items = Object.values(state.memoryItems || {});
    const item = items.find(
      (candidate) =>
        state.schemaVersion === 15 &&
        candidate.status === 'stored' &&
        candidate.applicationStatus === 'blocked' &&
        computeMemoryItemRecordDigest(candidate) === candidate.recordDigest,
    );
    if (item) {
      return { runtimeRoot: path.dirname(statePath), statePath, state, item };
    }
  }
  throw new Error('Seeded durable MemoryItem state was not found');
}

function createRuntime(runtimeRoot) {
  return createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
    councilLiveAdapter: {
      executePosition() {
        throw new Error('MemoryRecall preview must not call a provider');
      },
      executeSynthesis() {
        throw new Error('MemoryRecall preview must not call a provider');
      },
    },
  });
}

function buildRecallRequest(item, overrides = {}) {
  return {
    memoryItemId: item.id,
    memoryItemRecordDigest: item.recordDigest,
    evaluatedAt: new Date().toISOString(),
    recallSpec: {
      purpose: 'Review this exact project-local evidence for a bounded follow-up.',
      workspaceScope: { projectId: item.projectId },
      applicability: {
        summary: item.applicability.summary,
        targetPathAllowlist: [...item.applicability.targetPathAllowlist],
        verificationCommands: [...item.applicability.verificationCommands],
      },
      evidenceRefs: [...item.evidenceRefs],
      negativeEvidenceRefs: [...item.negativeEvidenceRefs],
      redactionRefs: [...item.redactionRefs],
      reviewRefs: [...item.reviewRefs],
      acknowledgement: RECALL_ACKNOWLEDGEMENT,
      nonApplicationStatement: NON_APPLICATION_STATEMENT,
    },
    ...overrides,
  };
}

function deepFrozen(value) {
  if (!value || typeof value !== 'object') return true;
  return Object.isFrozen(value) && Object.values(value).every(deepFrozen);
}

function assertNoWrite(runtimeRoot, operation, pattern) {
  const statePath = path.join(runtimeRoot, 'state.json');
  const before = fs.readFileSync(statePath, 'utf8');
  assert.throws(operation, pattern);
  assert.equal(fs.readFileSync(statePath, 'utf8'), before);
}

function writeState(runtimeRoot, state) {
  fs.mkdirSync(runtimeRoot, { recursive: true });
  fs.writeFileSync(
    path.join(runtimeRoot, 'state.json'),
    `${JSON.stringify(state, null, 2)}\n`,
  );
}

async function main() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });
  try {
    const seed = seedStoredMemoryItem();
    const runtime = createRuntime(seed.runtimeRoot);
    const request = buildRecallRequest(seed.item);

    if (seedOnly) {
      process.stdout.write(
        `${JSON.stringify(
          {
            ok: true,
            mode: MODE,
            seedOnly: true,
            runtimeRoot: seed.runtimeRoot,
            memoryItem: seed.item,
            learningCandidate: seed.state.learningCandidates[
              seed.item.sourceLearningCandidateId
            ],
            recallPreviewRequest: request,
          },
          null,
          2,
        )}\n`,
      );
      return;
    }

    const stateBytesBefore = fs.readFileSync(seed.statePath, 'utf8');
    const sourcePath = path.join(repoRoot, 'src', 'runtime', 'runtime-service.js');
    const sourceBytesBefore = fs.readFileSync(sourcePath, 'utf8');
    const snapshotBefore = runtime.getSnapshot();
    assert.equal(snapshotBefore.schemaVersion, 15);
    assert.equal(
      Object.prototype.hasOwnProperty.call(snapshotBefore, 'memoryRecalls'),
      true,
    );
    assert.deepEqual(snapshotBefore.memoryRecalls, {});

    let saveCount = 0;
    const originalRenameSync = fs.renameSync;
    fs.renameSync = (source, target) => {
      if (target === seed.statePath) saveCount += 1;
      return originalRenameSync(source, target);
    };
    let preview;
    try {
      preview = runtime.previewMemoryItemRecall(request);
    } finally {
      fs.renameSync = originalRenameSync;
    }

    assert.equal(saveCount, 0);
    assert.equal(preview.persisted, false);
    assert.equal(preview.status, 'recall-ready');
    assert.equal(preview.retrievalMode, 'exact-id-operator-selected');
    assert.equal(preview.sourceMemoryItemId, seed.item.id);
    assert.equal(preview.sourceMemoryItemRecordDigest, seed.item.recordDigest);
    assert.equal(preview.projectId, seed.item.projectId);
    assert.equal(preview.recommendationStatus, 'blocked');
    assert.equal(preview.applicationStatus, 'blocked');
    assert.equal(preview.missionInjectionStatus, 'blocked');
    assert.equal(preview.nonApplicationStatement, NON_APPLICATION_STATEMENT);
    assert.deepEqual(preview.negativeEvidenceRefs, [...seed.item.negativeEvidenceRefs].sort());
    assert.deepEqual(preview.blockedActions, BLOCKED_ACTIONS);
    assert.match(preview.id, /^memory-recall-preview-[a-f0-9]{16}$/);
    assert.match(preview.previewDigest, /^[a-f0-9]{64}$/);
    assert.equal(deepFrozen(preview), true);
    assert.equal(fs.readFileSync(seed.statePath, 'utf8'), stateBytesBefore);
    assert.equal(fs.readFileSync(sourcePath, 'utf8'), sourceBytesBefore);

    const replay = runtime.previewMemoryItemRecall(request);
    assert.deepEqual(replay, preview);
    const changed = runtime.previewMemoryItemRecall({
      ...request,
      recallSpec: {
        ...request.recallSpec,
        purpose: `${request.recallSpec.purpose} Keep operator review explicit.`,
      },
    });
    assert.notEqual(changed.previewDigest, preview.previewDigest);
    assert.equal(fs.readFileSync(seed.statePath, 'utf8'), stateBytesBefore);

    const malformedCases = [
      [
        { ...request, memoryItemRecordDigest: '0'.repeat(64) },
        /recordDigest does not match/,
      ],
      [
        { ...request, automaticSearch: true },
        /unexpected or missing fields/,
      ],
      [
        {
          ...request,
          recallSpec: {
            ...request.recallSpec,
            workspaceScope: { projectId: 'project-other' },
          },
        },
        /workspaceScope/,
      ],
      [
        {
          ...request,
          recallSpec: {
            ...request.recallSpec,
            applicability: {
              ...request.recallSpec.applicability,
              targetPathAllowlist: ['src/not-approved.js'],
            },
          },
        },
        /unsupported source value/,
      ],
      [
        {
          ...request,
          recallSpec: {
            ...request.recallSpec,
            negativeEvidenceRefs: request.recallSpec.negativeEvidenceRefs.slice(1),
          },
        },
        /non-empty array|preserve every source value/,
      ],
      [
        {
          ...request,
          recallSpec: {
            ...request.recallSpec,
            purpose: 'authorization=Bearer-secret-token',
          },
        },
        /credential marker/,
      ],
      [
        {
          ...request,
          recallSpec: {
            ...request.recallSpec,
            acknowledgement: 'automatic-retrieval-approved',
          },
        },
        /acknowledgement/,
      ],
      [
        {
          ...request,
          recallSpec: {
            ...request.recallSpec,
            nonApplicationStatement: 'apply-to-next-mission',
          },
        },
        /nonApplicationStatement/,
      ],
    ];
    for (const [invalidRequest, pattern] of malformedCases) {
      assertNoWrite(seed.runtimeRoot, () => runtime.previewMemoryItemRecall(invalidRequest), pattern);
    }

    const expiredRoot = path.join(tempRoot, 'expired-item');
    const expiredState = structuredClone(seed.state);
    const expiredItem = expiredState.memoryItems[seed.item.id];
    const pastCreatedAt = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expiredItem.createdAt = pastCreatedAt;
    expiredItem.updatedAt = pastCreatedAt;
    expiredItem.storageApproval.reviewedAt = pastCreatedAt;
    expiredItem.expiresAt = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    expiredItem.recordDigest = computeMemoryItemRecordDigest(expiredItem);
    writeState(expiredRoot, expiredState);
    assertNoWrite(
      expiredRoot,
      () =>
        createRuntime(expiredRoot).previewMemoryItemRecall(
          buildRecallRequest(expiredItem),
        ),
      /expired/,
    );

    const widenedRoot = path.join(tempRoot, 'widened-item');
    const widenedState = structuredClone(seed.state);
    widenedState.memoryItems[seed.item.id].applicationStatus = 'active';
    widenedState.memoryItems[seed.item.id].recordDigest = computeMemoryItemRecordDigest(
      widenedState.memoryItems[seed.item.id],
    );
    writeState(widenedRoot, widenedState);
    assertNoWrite(
      widenedRoot,
      () => createRuntime(widenedRoot).previewMemoryItemRecall(request),
      /invalid immutable status or blocked authority/,
    );

    assert.equal(fs.readFileSync(seed.statePath, 'utf8'), stateBytesBefore);
    assert.deepEqual(runtime.getSnapshot(), snapshotBefore);

    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          mode: MODE,
          preview: {
            id: preview.id,
            previewDigest: preview.previewDigest,
            sourceMemoryItemId: preview.sourceMemoryItemId,
            retrievalMode: preview.retrievalMode,
            persisted: preview.persisted,
            deepFrozen: true,
            exactReplay: true,
          },
          safety: {
            saveStateCalls: saveCount,
            schemaVersion: 15,
            stateBytesUnchanged: true,
            sourceBytesUnchanged: true,
            automaticSelectionBlocked: true,
            negativeEvidenceDroppingBlocked: true,
            recommendationApplicationMissionInjectionBlocked: true,
            expiredCrossWorkspaceCredentialMalformedNoOutput: true,
          },
        },
        null,
        2,
      )}\n`,
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
