#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const docPath = path.join(repoRoot, 'docs', '13_harness-baseline.md');
const scriptPath = path.join(repoRoot, 'scripts', 'markitdown-convert.mjs');

assert.ok(fs.existsSync(docPath), 'docs/13_harness-baseline.md missing');
assert.ok(fs.existsSync(scriptPath), 'scripts/markitdown-convert.mjs missing');

const doc = fs.readFileSync(docPath, 'utf8');
assert.match(doc, /Harness Baseline/);
assert.match(doc, /markitdown/i);
assert.match(doc, /hermes-agent/i);
assert.match(doc, /mempalace/i);
assert.match(doc, /Harness-First/i);

console.log(JSON.stringify({ ok: true, docPath, scriptPath }, null, 2));
