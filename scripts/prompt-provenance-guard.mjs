#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

requireNoCliArgs(process.argv.slice(2), { mode: 'prompt-provenance-guard' });

const EXPECTED_PROMPT_FILES = [
  'prompts/architect.md',
  'prompts/builder.md',
  'prompts/planner.md',
  'prompts/reviewer.md',
  'prompts/router.md',
  'prompts/task-breaker.md',
];

const BLOCKED_PROMPT_MARKERS = [
  'CL4R1T4S',
  'jailbreak',
  'prompt leak',
  'system prompt leak',
  'system prompt extraction',
  'reveal the system prompt',
  'ignore previous instructions',
  'DAN mode',
];

const REQUIRED_CONTRACT_MARKERS = ['## forbidden actions', '## done criteria'];
const REQUIRED_AGGREGATE_ANCHORS = ['project_path', 'source of truth', 'approval', 'review'];

function readPrompt(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  const exists = fs.existsSync(absolutePath);
  const content = exists ? fs.readFileSync(absolutePath, 'utf8') : '';

  return {
    path: relativePath,
    exists,
    bytes: Buffer.byteLength(content, 'utf8'),
    content,
  };
}

function findBlockedMarkers(prompt) {
  const lowerContent = prompt.content.toLowerCase();

  return BLOCKED_PROMPT_MARKERS.filter((marker) => lowerContent.includes(marker.toLowerCase()));
}

function findMissingContractMarkers(prompt) {
  const lowerContent = prompt.content.toLowerCase();

  return REQUIRED_CONTRACT_MARKERS.filter((marker) => !lowerContent.includes(marker.toLowerCase()));
}

const prompts = EXPECTED_PROMPT_FILES.map(readPrompt);
const missingPrompts = prompts.filter((prompt) => !prompt.exists).map((prompt) => prompt.path);
const blockedMarkerFindings = prompts
  .map((prompt) => ({
    path: prompt.path,
    markers: findBlockedMarkers(prompt),
  }))
  .filter((finding) => finding.markers.length > 0);
const contractFindings = prompts
  .map((prompt) => ({
    path: prompt.path,
    missingMarkers: findMissingContractMarkers(prompt),
  }))
  .filter((finding) => finding.missingMarkers.length > 0);
const aggregatePromptText = prompts.map((prompt) => prompt.content).join('\n').toLowerCase();
const missingAggregateAnchors = REQUIRED_AGGREGATE_ANCHORS.filter(
  (anchor) => !aggregatePromptText.includes(anchor.toLowerCase()),
);

const report = {
  ok:
    missingPrompts.length === 0 &&
    blockedMarkerFindings.length === 0 &&
    contractFindings.length === 0 &&
    missingAggregateAnchors.length === 0,
  mode: 'prompt-provenance-guard',
  posture: 'source-only-negative-guardrail',
  upstreamContentImported: false,
  runtimeMutation: false,
  dependencyRequired: false,
  promptCount: prompts.length,
  blockedPromptMarkers: BLOCKED_PROMPT_MARKERS,
  requiredContractMarkers: REQUIRED_CONTRACT_MARKERS,
  requiredAggregateAnchors: REQUIRED_AGGREGATE_ANCHORS,
  prompts: prompts.map((prompt) => ({
    path: prompt.path,
    exists: prompt.exists,
    bytes: prompt.bytes,
  })),
  failures: {
    missingPrompts,
    blockedMarkerFindings,
    contractFindings,
    missingAggregateAnchors,
  },
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
