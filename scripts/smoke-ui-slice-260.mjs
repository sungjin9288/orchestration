import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

assert.doesNotMatch(app, /activeProjectName:\s*document\.querySelector/);
assert.doesNotMatch(app, /activeProjectPath:\s*document\.querySelector/);
assert.doesNotMatch(app, /runtimeRoot:\s*document\.querySelector/);
assert.doesNotMatch(app, /runtimeStatusCopy:\s*document\.querySelector/);
assert.doesNotMatch(app, /activeRunCount:\s*document\.querySelector/);
assert.doesNotMatch(app, /activeRunCopy:\s*document\.querySelector/);
assert.doesNotMatch(app, /pendingGateCount:\s*document\.querySelector/);
assert.doesNotMatch(app, /pendingGateCopy:\s*document\.querySelector/);
assert.doesNotMatch(app, /companyFloorBoard:\s*document\.querySelector/);
assert.doesNotMatch(app, /surfaceFocusStrip:\s*document\.querySelector/);
assert.doesNotMatch(app, /summaryCards:\s*\{/);

assert.doesNotMatch(app, /function renderSummary\(/);
assert.doesNotMatch(app, /function renderCompanyFloorBoard\(/);
assert.doesNotMatch(app, /function getSurfaceFocusKindDisplay\(/);
assert.doesNotMatch(app, /function renderSurfaceFocusCard\(/);
assert.doesNotMatch(app, /function renderHomeCompanyPulseStrip\(/);
assert.doesNotMatch(app, /function renderSurfaceFocusStrip\(/);

assert.match(app, /function getCompanyFloorBoardEntries\(data, navGroupId\)/);
assert.match(app, /function renderControlOverview\(data\)/);
assert.match(app, /controlOverview:\s*document\.querySelector\('#control-overview'\)/);

console.log(
  JSON.stringify(
    {
      ok: true,
      controlOverviewCleanup: {
        removedQueries: [
          'activeProjectName',
          'activeProjectPath',
          'runtimeRoot',
          'runtimeStatusCopy',
          'activeRunCount',
          'activeRunCopy',
          'pendingGateCount',
          'pendingGateCopy',
          'companyFloorBoard',
          'surfaceFocusStrip',
          'summaryCards',
        ],
        removedHelpers: [
          'renderSummary',
          'renderCompanyFloorBoard',
          'getSurfaceFocusKindDisplay',
          'renderSurfaceFocusCard',
          'renderHomeCompanyPulseStrip',
          'renderSurfaceFocusStrip',
        ],
        retainedHelpers: ['getCompanyFloorBoardEntries', 'renderControlOverview'],
      },
    },
    null,
    2,
  ),
);
