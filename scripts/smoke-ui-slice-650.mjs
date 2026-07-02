import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsSource = fs.readFileSync(path.join(repoRoot, 'ui', 'app.js'), 'utf8');
const indexHtmlSource = fs.readFileSync(path.join(repoRoot, 'ui', 'index.html'), 'utf8');

// The global click dispatcher must only treat explicit nav buttons as surface
// navigation. A broad closest('[data-surface]') match also captures the
// surface <section> ancestors, which swallows every in-surface
// [data-action] button click before the generic action dispatch runs.
assert.match(appJsSource, /const navButton = event\.target\.closest\('\.nav-button\[data-surface\]'\);/);
assert.doesNotMatch(appJsSource, /const navButton = event\.target\.closest\('\[data-surface\]'\);/);

// Surface sections still carry data-surface for show/hide state, so the
// narrowed selector is what keeps in-surface clicks reachable.
assert.match(indexHtmlSource, /<section id="surface-taskboard" [^>]*data-surface="taskboard"/);
assert.match(indexHtmlSource, /<button class="nav-button[^"]*" data-surface="taskboard"/);

// Representative in-surface action buttons that the dispatcher must still
// reach after the navButton branch.
assert.match(appJsSource, /data-action="select-task"/);
assert.match(appJsSource, /data-action="run-builder-preflight"/);
assert.match(appJsSource, /data-action="select-artifact"/);
assert.match(appJsSource, /actionButton\.dataset\.action === 'run-builder-preflight'/);

// Browser-level regression coverage: the qa runners drive these buttons with
// real clicks instead of QA hooks or direct endpoint posts.
const qaSlice04Runner = fs.readFileSync(path.join(repoRoot, 'scripts', 'qa-slice-04-runner.mjs'), 'utf8');
const qaSlice05Runner = fs.readFileSync(path.join(repoRoot, 'scripts', 'qa-slice-05-runner.mjs'), 'utf8');

assert.match(qaSlice04Runner, /selector: `\[data-action="select-task"\]\[data-id="\$\{taskId\}"\]`/);
assert.match(qaSlice05Runner, /selector: `\[data-action="run-builder-preflight"\]\[data-id="\$\{taskId\}"\]:not\(\[disabled\]\)`/);

console.log(
  JSON.stringify(
    {
      ok: true,
      dispatcher: 'nav-button-scoped',
      inSurfaceActionsReachable: true,
      realClickCoverage: ['scripts/qa-slice-04-runner.mjs', 'scripts/qa-slice-05-runner.mjs'],
    },
    null,
    2,
  ),
);
