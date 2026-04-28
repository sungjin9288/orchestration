#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const docPath = path.join(repoRoot, 'docs', '13_harness-baseline.md');
const registryPath = path.join(repoRoot, 'scripts', 'harness-registry.mjs');
const statusScript = path.join(repoRoot, 'scripts', 'harness-status.mjs');
const runScript = path.join(repoRoot, 'scripts', 'harness-run.mjs');

const doc = fs.readFileSync(docPath, 'utf8');
const registry = fs.readFileSync(registryPath, 'utf8');

assert.match(doc, /Hermes Agent ACP bridge \(future-post-v1\)/);
assert.match(doc, /optional ACP-compatible harness reference/);
assert.match(doc, /permission callback bridge/);
assert.match(doc, /file-safety denylist/);
assert.match(doc, /secret redaction patterns/);
assert.match(doc, /jittered retry utility/);
assert.match(doc, /SKILL\.md preprocessing boundaries/);
assert.match(doc, /memory-provider fencing/);
assert.match(doc, /must remain non-executable in the current harness gate/);
assert.match(doc, /Do not install Hermes through `curl \| bash` from this repo/);
assert.match(doc, /Hermes gateway surfaces such as Telegram, Discord, Slack, WhatsApp, Signal, Email, or webhooks/);
assert.match(doc, /Hermes cron autonomy, cloud terminal backends, or unattended background execution/);

assert.match(registry, /id: 'hermes-agent'/);
assert.match(registry, /posture: 'future-post-v1'/);
assert.match(registry, /kind: 'acp-agent-harness-reference'/);
assert.doesNotMatch(registry, /runner: .*hermes/);

const statusResult = spawnSync(process.execPath, [statusScript], {
  cwd: repoRoot,
  encoding: 'utf8',
});
assert.equal(statusResult.status, 0, `harness-status failed: ${statusResult.stderr}`);
const payload = JSON.parse(statusResult.stdout);
const hermes = payload.harnesses.find((harness) => harness.id === 'hermes-agent');
assert.ok(hermes, 'hermes-agent status missing');
assert.equal(hermes.posture, 'future-post-v1');
assert.equal(hermes.kind, 'acp-agent-harness-reference');
assert.equal(hermes.state, 'deferred');
assert.equal(hermes.executable, false);
assert.equal(hermes.runner, null);
assert.match(hermes.note, /Future ACP harness reference only/);
assert.match(hermes.installReview, /upstream MIT license/);

const runResult = spawnSync(process.execPath, [runScript, 'hermes-agent'], {
  cwd: repoRoot,
  encoding: 'utf8',
});
assert.equal(runResult.status, 2, 'hermes-agent must not be executable in current harness gate');
assert.match(runResult.stderr, /not executable in the current repo posture/i);

console.log(
  JSON.stringify(
    {
      ok: true,
      hermesAgentAcpBridgeBoundary: {
        posture: hermes.posture,
        state: hermes.state,
        executable: hermes.executable,
        runner: hermes.runner,
      },
    },
    null,
    2,
  ),
);
