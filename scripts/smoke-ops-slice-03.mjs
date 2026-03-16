import assert from 'node:assert/strict';
import path from 'node:path';

import contractsModule from '../src/runtime/contracts.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const {
  ARTIFACT_CATALOG,
  ARTIFACT_PREVIEW_MODE,
  ARTIFACT_RETENTION_TIER,
  ARTIFACT_TYPE,
} = contractsModule;
const { createRuntimeService } = runtimeServiceModule;

const runtimeRoot = path.join(process.cwd(), 'var', 'ops-slice-03');
const runtime = createRuntimeService({ runtimeRoot });

runtime.resetRuntime();

const expectedArtifactTypes = [
  'architecture',
  'breakdown',
  'change-summary',
  'close-out',
  'commit-package',
  'commit-result',
  'diff',
  'output',
  'patch',
  'plan',
  'preflight',
  'release-package',
  'review',
];

assert.deepEqual(Object.values(ARTIFACT_TYPE).sort(), expectedArtifactTypes);
assert.deepEqual(Object.keys(ARTIFACT_CATALOG).sort(), expectedArtifactTypes);

const tierAArtifactTypes = Object.entries(ARTIFACT_CATALOG)
  .filter(([, entry]) => entry.retentionTier === ARTIFACT_RETENTION_TIER.TIER_A)
  .map(([artifactType]) => artifactType)
  .sort();
const tierBArtifactTypes = Object.entries(ARTIFACT_CATALOG)
  .filter(([, entry]) => entry.retentionTier === ARTIFACT_RETENTION_TIER.TIER_B)
  .map(([artifactType]) => artifactType)
  .sort();
const tierCArtifactTypes = Object.entries(ARTIFACT_CATALOG)
  .filter(([, entry]) => entry.retentionTier === ARTIFACT_RETENTION_TIER.TIER_C)
  .map(([artifactType]) => artifactType)
  .sort();
const rawOnlyArtifactTypes = Object.entries(ARTIFACT_CATALOG)
  .filter(([, entry]) => entry.previewMode === ARTIFACT_PREVIEW_MODE.RAW_ONLY)
  .map(([artifactType]) => artifactType)
  .sort();
const structuredWithRawFallbackArtifactTypes = Object.entries(ARTIFACT_CATALOG)
  .filter(([, entry]) => entry.previewMode === ARTIFACT_PREVIEW_MODE.STRUCTURED_WITH_RAW_FALLBACK)
  .map(([artifactType]) => artifactType)
  .sort();
const latestCenteredBrowseArtifactTypes = Object.entries(ARTIFACT_CATALOG)
  .filter(([, entry]) => entry.latestCenteredBrowse)
  .map(([artifactType]) => artifactType)
  .sort();

assert.deepEqual(tierAArtifactTypes, [
  'change-summary',
  'close-out',
  'commit-package',
  'commit-result',
  'diff',
  'patch',
  'preflight',
  'release-package',
  'review',
]);
assert.deepEqual(tierBArtifactTypes, ['architecture', 'breakdown', 'plan']);
assert.deepEqual(tierCArtifactTypes, ['output']);
assert.deepEqual(rawOnlyArtifactTypes, ['architecture', 'output', 'plan']);
assert.deepEqual(structuredWithRawFallbackArtifactTypes, [
  'breakdown',
  'change-summary',
  'close-out',
  'commit-package',
  'commit-result',
  'diff',
  'patch',
  'preflight',
  'release-package',
  'review',
]);
assert.deepEqual(latestCenteredBrowseArtifactTypes, ['architecture', 'breakdown', 'plan']);

for (const nonArtifactType of ['approval', 'decision', 'execution-log', 'verification']) {
  assert.equal(
    Object.prototype.hasOwnProperty.call(ARTIFACT_CATALOG, nonArtifactType),
    false,
    `${nonArtifactType} must not be part of the artifact catalog`,
  );
}

for (const [artifactType, entry] of Object.entries(ARTIFACT_CATALOG)) {
  if (entry.retentionTier === ARTIFACT_RETENTION_TIER.TIER_A) {
    assert.equal(entry.provenanceCritical, true, `${artifactType} must stay provenance-critical`);
  }

  if (entry.retentionTier !== ARTIFACT_RETENTION_TIER.TIER_A) {
    assert.equal(
      entry.provenanceCritical,
      false,
      `${artifactType} must not be marked provenance-critical outside Tier A`,
    );
  }
}

const project = runtime.createProject({
  name: 'orchestration',
  projectPath: process.cwd(),
});
const task = runtime.createTask({
  projectId: project.id,
  title: 'Ops slice 03 retention smoke',
  intent: 'Lock artifact taxonomy, preview mode, and write-time validation.',
});
const run = runtime.startPlaceholderRun({ taskId: task.id });

const outputArtifact = runtime.recordArtifact({
  taskId: task.id,
  runId: run.id,
  type: ARTIFACT_TYPE.OUTPUT,
  content: '# output\n\nraw fallback only\n',
});

assert.equal(outputArtifact.type, 'output');
assert.throws(
  () =>
    runtime.recordArtifact({
      taskId: task.id,
      runId: run.id,
      type: 'verification',
      content: '# invalid\n',
    }),
  /Unsupported artifact type: verification/i,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      outputArtifactId: outputArtifact.id,
      latestCenteredBrowseArtifactTypes,
      rawOnlyArtifactTypes,
      structuredWithRawFallbackArtifactTypes,
      tierAArtifactTypes,
      tierBArtifactTypes,
      tierCArtifactTypes,
    },
    null,
    2,
  ),
);
