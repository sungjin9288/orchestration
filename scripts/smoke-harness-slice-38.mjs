import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const memoryBriefScript = path.join(repoRoot, 'scripts', 'memory-brief.mjs');

const statusResult = spawnSync(process.execPath, [memoryBriefScript], {
  cwd: repoRoot,
  encoding: 'utf8',
});

assert.equal(statusResult.status, 0, `memory brief failed: ${statusResult.stderr}`);

const payload = JSON.parse(statusResult.stdout);

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'memory-brief');
assert.equal(payload.posture, 'local-read-only-preview');
assert.equal(payload.persistence, 'none');
assert.equal(payload.runtimeMutation, false);
assert.equal(payload.dependencyRequired, false);
assert.equal(payload.sources.some((source) => source.path === 'tasks/todo.md' && source.exists), true);
assert.equal(payload.sources.some((source) => source.path === 'tasks/lessons.md' && source.exists), true);
assert.ok(payload.acceptedDecisionCount > 0);
assert.ok(payload.lessonCount > 0);
assert.equal(payload.openTaskCount, 0);
assert.equal(payload.openTaskPreview.length, 0);
assert.equal(
  payload.openTaskPreview.some((line) => /^#{1,6}\s+.*\[OPEN\]/.test(line)),
  false,
);

const searchResult = spawnSync(process.execPath, [memoryBriefScript, '--query', 'markitdown'], {
  cwd: repoRoot,
  encoding: 'utf8',
});

assert.equal(searchResult.status, 0, `memory brief search failed: ${searchResult.stderr}`);

const searchPayload = JSON.parse(searchResult.stdout);

assert.equal(searchPayload.search.query, 'markitdown');
assert.ok(searchPayload.search.hits.length > 0);
assert.equal(
  searchPayload.search.hits.some((hit) => hit.path === 'docs/13_harness-baseline.md'),
  true,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      memoryBrief: {
        mode: payload.mode,
        posture: payload.posture,
        openTaskCount: payload.openTaskCount,
        sourceCount: payload.sourceCount,
        searchQuery: searchPayload.search.query,
        searchHitCount: searchPayload.search.hits.length,
      },
    },
    null,
    2,
  ),
);
