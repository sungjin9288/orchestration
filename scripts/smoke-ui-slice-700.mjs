import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODE = 'ui-slice-700-durable-specialist-batch-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const appSource = fs.readFileSync(path.join(repoRoot, 'ui', 'app.js'), 'utf8');
const styleSource = fs.readFileSync(path.join(repoRoot, 'ui', 'styles.css'), 'utf8');
const serverSource = fs.readFileSync(
  path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
  'utf8',
);
const runtimeSource = fs.readFileSync(
  path.join(repoRoot, 'src', 'runtime', 'runtime-service.js'),
  'utf8',
);
const panelStart = appSource.indexOf('function renderSpecialistBatchPreview');
const panelEnd = appSource.indexOf(
  'function renderMissionWorkOrderCompileForm',
  panelStart,
);
assert.ok(panelStart >= 0 && panelEnd > panelStart);
const panelSource = appSource.slice(panelStart, panelEnd);

assert.match(appSource, /councilSpecialistBatch:\s*null/);
assert.match(appSource, /data-action="start-specialist-batch"/);
assert.match(appSource, /Run first attempt/);
assert.match(appSource, /execute-exact-readonly-specialist-batch-once/);
assert.match(appSource, /decision:\s*'start-first-attempt'/);
assert.match(appSource, /fetchOptionalJson\(/);
assert.match(
  appSource,
  /\/api\/council-sessions\/\$\{encodeURIComponent\(selectedCouncilSession\.id\)\}\/specialist-batch\?\$\{locator\}/,
);
assert.match(panelSource, /persist:true/);
assert.match(panelSource, /specialistCellAttempts/);
assert.doesNotMatch(
  panelSource,
  /data-action="(?:cancel|retry|persist|apply|schedule|provider)[^"]*"/,
);
assert.doesNotMatch(
  appSource,
  /localStorage\.(?:setItem|getItem)\([^)]*councilSpecialistBatch/,
);

assert.match(
  serverSource,
  /POST' && specialistBatchStartMatch/,
);
assert.match(
  serverSource,
  /runtime\.startCouncilSpecialistBatch\(/,
);
assert.match(
  serverSource,
  /runtime\.getSpecialistBatch\(/,
);
assert.match(
  serverSource,
  /runtime\.getCurrentCouncilSpecialistBatch\(/,
);
assert.match(
  serverSource,
  /queryKeys\.length !== 2/,
);
assert.match(
  serverSource,
  /payload\.specialistBatchId = error\.specialistBatchId/,
);

assert.match(runtimeSource, /startCouncilSpecialistBatch/);
assert.match(runtimeSource, /getCurrentCouncilSpecialistBatch/);
assert.match(runtimeSource, /getSpecialistBatch/);
assert.match(
  runtimeSource,
  /delete snapshotForPublicProjection\.specialistBatches/,
);
assert.match(
  runtimeSource,
  /delete snapshotForPublicProjection\.specialistCellAttempts/,
);

assert.match(
  styleSource,
  /\.specialist-batch-execution\s*\{[\s\S]*grid-template-columns: minmax\(280px, 1fr\) auto/,
);
assert.match(
  styleSource,
  /@media \(max-width: 720px\) \{[\s\S]*\.specialist-batch-actions\s*\{[\s\S]*grid-template-columns: 1fr/,
);
assert.match(
  styleSource,
  /\.specialist-batch-panel input\.text-input\s*\{[\s\S]*min-height: 42px/,
);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: MODE,
      authority: {
        firstAttemptOnly: true,
        providerControls: false,
        retryOrCancelControls: false,
        resultApplicationControls: false,
      },
      durability: {
        currentChainHydration: true,
        exactInspection: true,
        genericSnapshotMaps: false,
      },
      responsive: {
        desktopColumns: 2,
        mobileColumns: 1,
      },
    },
    null,
    2,
  )}\n`,
);
