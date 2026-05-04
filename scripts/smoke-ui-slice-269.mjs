import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const qaSlice06RunnerPath = path.join(repoRoot, 'scripts', 'qa-slice-06-runner.mjs');
const qaSlice07RunnerPath = path.join(repoRoot, 'scripts', 'qa-slice-07-runner.mjs');

const appJs = fs.readFileSync(appPath, 'utf8');
const qaSlice06Runner = fs.readFileSync(qaSlice06RunnerPath, 'utf8');
const qaSlice07Runner = fs.readFileSync(qaSlice07RunnerPath, 'utf8');

assert.match(appJs, /function registerQaHooks\(\)/);
assert.match(appJs, /window\.__orchestrationQa = \{/);
assert.match(appJs, /getState\(\)/);
assert.match(appJs, /openSurface\(surface, options = \{\}\)/);
assert.match(appJs, /async refresh\(\)/);
assert.match(appJs, /await refreshData\(\);/);
assert.match(appJs, /QA hook idle timeout/);
assert.match(appJs, /state\.menuGroup = getNavGroupForSurface\(surface\);/);
assert.match(appJs, /state\.surface = surface;/);
assert.match(appJs, /syncSelectionsFromTask\(options\.taskId\);/);
assert.match(appJs, /render\(\);/);
assert.match(appJs, /registerQaHooks\(\);\s*void bootstrap\(\);/s);
assert.match(qaSlice06Runner, /QA_BROWSER_FLAKE_ERROR_PATTERN =\s*[\s\S]*visibility/);
assert.match(qaSlice07Runner, /QA_BROWSER_FLAKE_ERROR_PATTERN =\s*[\s\S]*visibility/);
assert.match(qaSlice06Runner, /QA_BROWSER_FLAKE_ERROR_PATTERN =\s*[\s\S]*Timed out waiting for/);
assert.match(qaSlice07Runner, /QA_BROWSER_FLAKE_ERROR_PATTERN =\s*[\s\S]*Timed out waiting for/);
assert.match(qaSlice06Runner, /qa\.refresh\(\)/);
assert.match(qaSlice07Runner, /qa\.refresh\(\)/);

console.log(
  JSON.stringify(
    {
      ok: true,
      qaSurfaceHook: {
        markers: [
          'registerQaHooks()',
          'window.__orchestrationQa',
          'getState()',
          'openSurface(surface, options = {})',
          'refresh()',
          'state.menuGroup = getNavGroupForSurface(surface);',
          'state.surface = surface;',
          'syncSelectionsFromTask(options.taskId);',
          'registerQaHooks(); void bootstrap();',
        ],
        runnerFlakeGuards: [
          'scripts/qa-slice-06-runner.mjs: browser visibility timeouts',
          'scripts/qa-slice-07-runner.mjs: browser visibility timeouts',
          'scripts/qa-slice-06-runner.mjs: browser wait timeouts',
          'scripts/qa-slice-07-runner.mjs: browser wait timeouts',
          'scripts/qa-slice-06-runner.mjs: QA refresh hook',
          'scripts/qa-slice-07-runner.mjs: QA refresh hook',
        ],
      },
    },
    null,
    2,
  ),
);
