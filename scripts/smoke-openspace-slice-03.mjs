import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const delegateSkillPath = path.join(repoRoot, '.agents', 'skills', 'delegate-task', 'SKILL.md');
const discoverySkillPath = path.join(repoRoot, '.agents', 'skills', 'skill-discovery', 'SKILL.md');
const verificationStatusPath = path.join(repoRoot, 'scripts', 'verification_status.mjs');

const delegateSkill = fs.readFileSync(delegateSkillPath, 'utf8');
const discoverySkill = fs.readFileSync(discoverySkillPath, 'utf8');
const verificationStatus = fs.readFileSync(verificationStatusPath, 'utf8');

assert.match(delegateSkill, /## Host Credential Boundary/);
assert.match(delegateSkill, /host execution still depends on the current shell's LLM credentials/);
assert.match(delegateSkill, /Treat local skill discovery and MCP wiring as separate from `execute_task` execution readiness/);
assert.match(delegateSkill, /`blocked_missing_host_llm_credentials`/);
assert.match(delegateSkill, /host execution follow-up, not as a repo wiring regression/);
assert.match(delegateSkill, /continue locally when the task can be completed with repo tools/);
assert.match(delegateSkill, /Do not edit repo source-of-truth files/);
assert.match(delegateSkill, /If the response status or wrapper output indicates `blocked_missing_host_llm_credentials`/);

assert.match(discoverySkill, /## Execution Boundary/);
assert.match(discoverySkill, /Skill discovery can be healthy even when OpenSpace execution is blocked/);
assert.match(discoverySkill, /`blocked_missing_host_llm_credentials`/);
assert.match(discoverySkill, /do not treat it as a missing skill or repo wiring failure/);

assert.match(verificationStatus, /openspace-skill-credential-boundary/);
assert.match(verificationStatus, /scripts\/smoke-openspace-slice-03\.mjs/);

console.log(
  JSON.stringify(
    {
      ok: true,
      openSpaceSkillCredentialBoundary: {
        delegateSkill: '.agents/skills/delegate-task/SKILL.md',
        discoverySkill: '.agents/skills/skill-discovery/SKILL.md',
        hostExecutionFollowUp: 'blocked_missing_host_llm_credentials',
      },
    },
    null,
    2,
  ),
);
