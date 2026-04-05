import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const skillDir = path.join(repoRoot, '.agents', 'skills');
const openSpaceRoot = '/Users/sungjin/dev/personal/agent-infra/OpenSpace';
const openSpacePython = path.join(openSpaceRoot, '.venv', 'bin', 'python');
const codexConfig = path.join(process.env.HOME || '', '.codex', 'config.toml');
const resultSentinel = '__OPENSPACE_RESULT__';
const expectedSkills = [
  'orchestration-openspace-bootstrap',
  'orchestration-openspace-dev-loop',
  'orchestration-openspace-ui',
  'delegate-task',
  'skill-discovery',
];

const searchSnippet = `
import asyncio
import os
from openspace.mcp_server import search_skills

print("${resultSentinel}" + asyncio.run(
    search_skills(
        query=os.environ["OPENSPACE_SMOKE_QUERY"],
        source="local",
        limit=20,
        auto_import=False,
    )
))
`;

const executeSnippet = `
import asyncio
import os
from openspace.mcp_server import execute_task

print("${resultSentinel}" + asyncio.run(
    execute_task(
        task=(
            "Read the available local orchestration OpenSpace skills and "
            "answer with their names only. Do not modify files."
        ),
        workspace_dir=os.environ["OPENSPACE_SMOKE_WORKSPACE_DIR"],
        max_iterations=1,
        skill_dirs=[os.environ["OPENSPACE_SMOKE_SKILL_DIR"]],
        search_scope="local",
    )
))
`;

function runOpenSpace(snippet, { query = null, timeoutMs = 30000 } = {}) {
  const env = {
    ...process.env,
    OPENSPACE_HOST_SKILL_DIRS: skillDir,
    OPENSPACE_WORKSPACE: openSpaceRoot,
    OPENSPACE_BACKEND_SCOPE: 'shell',
    OPENSPACE_ENABLE_RECORDING: 'false',
    OPENSPACE_SMOKE_SKILL_DIR: skillDir,
    OPENSPACE_SMOKE_WORKSPACE_DIR: repoRoot,
  };

  if (query) {
    env.OPENSPACE_SMOKE_QUERY = query;
  }

  const result = spawnSync(openSpacePython, ['-c', snippet], {
    cwd: repoRoot,
    env,
    encoding: 'utf8',
    timeout: timeoutMs,
  });

  const stdout = result.stdout || '';
  const stderr = result.stderr || '';
  const rawOutput = [stdout, stderr].filter(Boolean).join('\n').trim();

  if (result.error && result.error.code === 'ETIMEDOUT') {
    return {
      status: 'timeout',
      returncode: null,
      result: null,
      rawOutput,
    };
  }

  let payload = null;
  if (rawOutput.includes(resultSentinel)) {
    const raw = rawOutput.split(resultSentinel, 2)[1].trim();
    try {
      payload = JSON.parse(raw);
    } catch (error) {
      payload = { raw };
    }
  }

  return {
    status: 'completed',
    returncode: result.status,
    result: payload,
    rawOutput,
  };
}

function classifyExecute(run) {
  const payload = run.result || {};

  if (run.rawOutput.includes('No cookie auth credentials found')) {
    return {
      status: 'blocked_missing_host_llm_credentials',
      message:
        'execute_task reached OpenSpace runtime init, but LLM auth was missing in the current shell context (OpenRouter 401: No cookie auth credentials found).',
      taskResult: payload,
    };
  }

  if (run.rawOutput.includes('AuthenticationError')) {
    return {
      status: 'blocked_authentication_error',
      message: 'execute_task reached the OpenSpace runtime but failed on model authentication.',
      taskResult: payload,
    };
  }

  if (run.status === 'timeout') {
    return {
      status: 'timeout',
      message: 'execute_task did not finish within the smoke timeout.',
    };
  }

  if (payload.status === 'ok') {
    return {
      status: 'ok',
      message: 'execute_task completed from the current shell context.',
      taskResult: payload,
    };
  }

  return {
    status: 'error',
    message: 'execute_task did not complete successfully.',
    taskResult: payload,
  };
}

assert.ok(fs.existsSync(openSpacePython), `Missing OpenSpace python at ${openSpacePython}`);

const configText = fs.existsSync(codexConfig) ? fs.readFileSync(codexConfig, 'utf8') : '';
const repoSkillDirsPresent = fs
  .readdirSync(skillDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(skillDir, entry.name, 'SKILL.md')))
  .map((entry) => entry.name)
  .sort();

const missingSkillDirs = expectedSkills.filter((name) => !repoSkillDirsPresent.includes(name));

const searchRun = runOpenSpace(searchSnippet, {
  query: 'orchestration mission council execution deliverables openspace',
  timeoutMs: 30000,
});

assert.equal(searchRun.status, 'completed');
assert.ok(searchRun.result && typeof searchRun.result === 'object');

const discoveredNames = (searchRun.result.results || []).map((item) => item.name || '');
const missingDiscovered = expectedSkills.filter((name) => !discoveredNames.includes(name));

const executeRun = runOpenSpace(executeSnippet, { timeoutMs: 30000 });
const executeTask = classifyExecute(executeRun);

const report = {
  ok: missingSkillDirs.length === 0 && missingDiscovered.length === 0,
  repo: repoRoot,
  skillDir,
  openSpaceWorkspace: openSpaceRoot,
  openSpacePython,
  expectedSkills,
  repoSkillDirsPresent,
  missingSkillDirs,
  localSearch: {
    count: searchRun.result.count,
    discoveredNames,
    missingExpectedSkills: missingDiscovered,
  },
  mcpConfig: {
    path: codexConfig,
    hasOpenSpaceServer: configText.includes('[mcp_servers.openspace]'),
    mentionsRepoSkillDir: configText.includes(skillDir),
    mentionsWorkspace: configText.includes(openSpaceRoot),
  },
  executeTask,
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
