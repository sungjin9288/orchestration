import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import companyBlueprintModule from '../src/runtime/company-blueprint.js';
import contractsModule from '../src/runtime/contracts.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { loadCompanyBlueprint, readCompanyBlueprintStatus } = companyBlueprintModule;
const { createEmptyState } = contractsModule;
const { createRuntimeService } = runtimeServiceModule;

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot = path.join(repoRoot, 'var', 'runtime-company-blueprint-smoke');
const roleNames = [
  'conductor',
  'strategist',
  'architect',
  'decomposer',
  'researcher',
  'builder',
  'reviewer',
  'qa',
  'ops',
];
const roleHeadings = [
  '## Objective',
  '## Inputs',
  '## Outputs',
  '## Decision Rules',
  '## Tool And Workspace Boundary',
  '## Stop And Escalation',
  '## Non-Authority',
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function createFixture(name, mutate = null) {
  const fixtureRoot = path.join(tempRoot, 'fixtures', name);
  fs.rmSync(fixtureRoot, { force: true, recursive: true });
  fs.mkdirSync(path.join(fixtureRoot, 'docs'), { recursive: true });
  fs.cpSync(path.join(repoRoot, 'company'), path.join(fixtureRoot, 'company'), {
    recursive: true,
  });

  for (const documentName of [
    '48_ai-company-master-plan.md',
    '49_agent-runtime-contract.md',
    '52_ai-company-runtime-blueprint-implementation-plan.md',
  ]) {
    fs.copyFileSync(
      path.join(repoRoot, 'docs', documentName),
      path.join(fixtureRoot, 'docs', documentName),
    );
  }

  const fixtureBlueprintPath = path.join(fixtureRoot, 'company', 'blueprint.json');
  mutate?.({ fixtureRoot, blueprintPath: fixtureBlueprintPath });
  return { fixtureRoot, blueprintPath: fixtureBlueprintPath };
}

function assertFixtureError(name, expectedCode, mutate) {
  const fixture = createFixture(name, mutate);
  assert.throws(
    () =>
      loadCompanyBlueprint({
        blueprintPath: fixture.blueprintPath,
        repoRoot: fixture.fixtureRoot,
      }),
    (error) => error?.code === expectedCode,
  );

  const status = readCompanyBlueprintStatus({
    blueprintPath: fixture.blueprintPath,
    repoRoot: fixture.fixtureRoot,
  });
  assert.equal(status.status, 'invalid');
  assert.equal(status.blueprint, null);
  assert.deepEqual(status.errors.map((error) => error.code), [expectedCode]);
  assert.equal(Object.isFrozen(status), true);
}

fs.rmSync(tempRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
fs.mkdirSync(tempRoot, { recursive: true });

try {
  const blueprint = loadCompanyBlueprint({ blueprintPath, repoRoot });
  const secondBlueprint = loadCompanyBlueprint({ blueprintPath, repoRoot });
  const readyStatus = readCompanyBlueprintStatus({ blueprintPath, repoRoot });

  assert.equal(blueprint.schemaVersion, 1);
  assert.equal(blueprint.companyId, 'orchestration-local-company');
  assert.equal(blueprint.agentProfiles.length, 9);
  assert.deepEqual(
    blueprint.agentProfiles.map((profile) => profile.role),
    roleNames,
  );
  assert.deepEqual(
    blueprint.agentProfiles.map((profile) => profile.id),
    secondBlueprint.agentProfiles.map((profile) => profile.id),
  );
  assert.equal(readyStatus.status, 'ready');
  assert.equal(readyStatus.sourceRefs.length, 10);
  assert.equal(Object.isFrozen(blueprint), true);
  assert.equal(Object.isFrozen(blueprint.agentProfiles[0].authority), true);
  assert.throws(() => {
    blueprint.agentProfiles[0].authority.canPush = true;
  }, TypeError);

  for (const profile of blueprint.agentProfiles) {
    assert.equal(profile.authority.canMutateSource, false);
    assert.equal(profile.authority.canCommit, false);
    assert.equal(profile.authority.canPush, false);
    assert.deepEqual(
      profile.providerPolicy.allowedModes,
      ['conductor', 'strategist', 'architect', 'decomposer'].includes(profile.role)
        ? ['local-stub', 'openai-responses']
        : ['local-stub'],
    );
    assert.deepEqual(profile.toolPolicy.write, []);
    assert.match(profile.instructionsRef, /^company\/roles\/[a-z]+\.md$/);

    const roleSource = fs.readFileSync(path.join(repoRoot, profile.instructionsRef), 'utf8');
    assert.match(roleSource, new RegExp(`^# Role: ${profile.displayName}$`, 'm'));

    for (const heading of roleHeadings) {
      assert.match(roleSource, new RegExp(`^${heading}$`, 'm'));
    }

    assert.doesNotMatch(roleSource, /OPENAI_API_KEY|Bearer\s+|sk-[A-Za-z0-9]/);
  }

  assert.equal(blueprint.defaultTerminationPolicy.maxProviderCalls, 5);
  assert.equal(blueprint.defaultStaffingPolicy.parallelSpecialistsAllowed, false);
  assert.equal(blueprint.authorityPolicy.runtimeAgentPushAllowed, false);

  const unconfiguredRuntimeRoot = path.join(tempRoot, 'runtime-unconfigured');
  const unconfiguredRuntime = createRuntimeService({ runtimeRoot: unconfiguredRuntimeRoot });
  unconfiguredRuntime.resetRuntime();
  const unconfiguredSnapshot = unconfiguredRuntime.getSnapshot();

  assert.equal(Object.hasOwn(unconfiguredSnapshot, 'companyRuntime'), false);
  assert.deepEqual(Object.keys(unconfiguredSnapshot).sort(), Object.keys(createEmptyState()).sort());

  const configuredRuntimeRoot = path.join(tempRoot, 'runtime-configured');
  const configuredRuntime = createRuntimeService({
    runtimeRoot: configuredRuntimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
  });
  configuredRuntime.resetRuntime();

  const project = configuredRuntime.createProject({
    name: 'ai-company-blueprint-smoke',
    projectPath: repoRoot,
  });
  const mission = configuredRuntime.createMission({
    projectId: project.id,
    title: 'Preserve deterministic Council baseline',
    goal: 'Verify blueprint evidence stays separate from Council execution.',
    constraints: 'Do not execute runtime agents or providers.',
  });
  const council = configuredRuntime.createCouncilSessionForMission({ missionId: mission.id });
  const configuredSnapshot = configuredRuntime.getSnapshot();

  assert.equal(configuredSnapshot.schemaVersion, 14);
  assert.equal(configuredSnapshot.companyRuntime.status, 'ready');
  assert.equal(configuredSnapshot.companyRuntime.blueprint.agentProfiles.length, 9);
  assert.equal(Object.isFrozen(configuredSnapshot.companyRuntime), true);
  assert.deepEqual(
    council.councilSession.participants.map((participant) => participant.role),
    ['Conductor', 'Strategist', 'Architect', 'Decomposer'],
  );
  assert.equal(council.councilSession.status, 'pending-alignment');
  assert.ok(council.councilSession.transcript.length > 0);

  const persistedState = readJson(path.join(configuredRuntimeRoot, 'state.json'));
  assert.equal(persistedState.schemaVersion, 14);
  assert.equal(Object.hasOwn(persistedState, 'companyRuntime'), false);
  assert.equal(Object.hasOwn(persistedState, 'companyBlueprint'), false);
  assert.equal(Object.hasOwn(persistedState, 'agentProfiles'), false);

  const reloadedRuntime = createRuntimeService({
    runtimeRoot: configuredRuntimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
  });
  assert.deepEqual(
    reloadedRuntime
      .getSnapshot()
      .companyRuntime.blueprint.agentProfiles.map((profile) => profile.id),
    configuredSnapshot.companyRuntime.blueprint.agentProfiles.map((profile) => profile.id),
  );

  assert.equal(typeof configuredRuntime.createStaffingPlan, 'undefined');
  assert.equal(typeof configuredRuntime.executeCouncilRoles, 'undefined');
  assert.equal(typeof configuredRuntime.updateCompanyProfile, 'undefined');

  assertFixtureError('unknown-field', 'BLUEPRINT_FIELDS_INVALID', ({ blueprintPath: target }) => {
    const value = readJson(target);
    value.unknownAuthority = true;
    writeJson(target, value);
  });
  assertFixtureError('duplicate-id', 'BLUEPRINT_PROFILE_SET_INVALID', ({ blueprintPath: target }) => {
    const value = readJson(target);
    value.agentProfiles[1].id = value.agentProfiles[0].id;
    writeJson(target, value);
  });
  assertFixtureError(
    'unsupported-role',
    'BLUEPRINT_PROFILE_ROLE_POLICY_INVALID',
    ({ blueprintPath: target }) => {
      const value = readJson(target);
      value.agentProfiles[0].role = 'executive';
      writeJson(target, value);
    },
  );
  assertFixtureError(
    'unknown-tool',
    'BLUEPRINT_TOOL_ACTION_INVALID',
    ({ blueprintPath: target }) => {
      const value = readJson(target);
      value.agentProfiles[0].toolPolicy.read.push('network.unbounded');
      writeJson(target, value);
    },
  );
  assertFixtureError(
    'forbidden-authority',
    'BLUEPRINT_FORBIDDEN_AUTHORITY',
    ({ blueprintPath: target }) => {
      const value = readJson(target);
      value.agentProfiles[5].authority.canPush = true;
      writeJson(target, value);
    },
  );
  assertFixtureError(
    'unsafe-ref',
    'BLUEPRINT_UNSAFE_INSTRUCTIONS_REF',
    ({ blueprintPath: target }) => {
      const value = readJson(target);
      value.agentProfiles[0].instructionsRef = '../outside.md';
      writeJson(target, value);
    },
  );
  assertFixtureError(
    'missing-role-source',
    'BLUEPRINT_ROLE_SOURCE_NOT_FOUND',
    ({ fixtureRoot }) => {
      fs.rmSync(path.join(fixtureRoot, 'company', 'roles', 'architect.md'));
    },
  );
  assertFixtureError(
    'invalid-role-source',
    'BLUEPRINT_ROLE_SOURCE_INVALID',
    ({ fixtureRoot }) => {
      const rolePath = path.join(fixtureRoot, 'company', 'roles', 'qa.md');
      fs.writeFileSync(
        rolePath,
        fs.readFileSync(rolePath, 'utf8').replace('## Non-Authority', '## Missing Boundary'),
      );
    },
  );
  assertFixtureError(
    'role-symlink',
    'BLUEPRINT_UNSAFE_INSTRUCTIONS_REF',
    ({ fixtureRoot }) => {
      const rolePath = path.join(fixtureRoot, 'company', 'roles', 'ops.md');
      const outsidePath = path.join(fixtureRoot, 'outside-ops.md');
      fs.copyFileSync(rolePath, outsidePath);
      fs.rmSync(rolePath);
      fs.symlinkSync(outsidePath, rolePath);
    },
  );
  assertFixtureError(
    'source-ref-symlink',
    'BLUEPRINT_SOURCE_REF_INVALID',
    ({ fixtureRoot }) => {
      const sourcePath = path.join(fixtureRoot, 'docs', '48_ai-company-master-plan.md');
      const outsidePath = path.join(fixtureRoot, 'outside-master-plan.md');
      fs.copyFileSync(sourcePath, outsidePath);
      fs.rmSync(sourcePath);
      fs.symlinkSync(outsidePath, sourcePath);
    },
  );
  assertFixtureError(
    'blueprint-symlink',
    'BLUEPRINT_UNSAFE_PATH',
    ({ fixtureRoot, blueprintPath: target }) => {
      const outsidePath = path.join(fixtureRoot, 'outside-blueprint.json');
      fs.copyFileSync(target, outsidePath);
      fs.rmSync(target);
      fs.symlinkSync(outsidePath, target);
    },
  );
  assertFixtureError('malformed-json', 'BLUEPRINT_JSON_INVALID', ({ blueprintPath: target }) => {
    fs.writeFileSync(target, '{"schemaVersion":1');
  });

  const missingFixture = createFixture('missing-blueprint', ({ blueprintPath: target }) => {
    fs.rmSync(target);
  });
  const missingStatus = readCompanyBlueprintStatus({
    blueprintPath: missingFixture.blueprintPath,
    repoRoot: missingFixture.fixtureRoot,
  });
  assert.equal(missingStatus.status, 'invalid');
  assert.deepEqual(missingStatus.errors.map((error) => error.code), ['BLUEPRINT_NOT_FOUND']);

  const invalidRuntimeFixture = createFixture(
    'invalid-runtime',
    ({ blueprintPath: target }) => {
      const value = readJson(target);
      value.agentProfiles[0].authority.canCommit = true;
      writeJson(target, value);
    },
  );
  const invalidRuntime = createRuntimeService({
    runtimeRoot: path.join(tempRoot, 'runtime-invalid'),
    companyBlueprintPath: invalidRuntimeFixture.blueprintPath,
    companyRepoRoot: invalidRuntimeFixture.fixtureRoot,
  });
  invalidRuntime.resetRuntime();
  invalidRuntime.createProject({ name: 'baseline-still-inspectable', projectPath: repoRoot });
  const invalidSnapshot = invalidRuntime.getSnapshot();
  assert.equal(invalidSnapshot.companyRuntime.status, 'invalid');
  assert.equal(invalidSnapshot.companyRuntime.blueprint, null);
  assert.equal(Object.keys(invalidSnapshot.projects).length, 1);

  const runtimeContracts = fs.readFileSync(path.join(repoRoot, 'src/runtime/contracts.js'), 'utf8');
  const fileStore = fs.readFileSync(path.join(repoRoot, 'src/runtime/file-store.js'), 'utf8');
  const server = fs.readFileSync(path.join(repoRoot, 'scripts/serve-ui-slice-01.mjs'), 'utf8');
  const companyConfig = fs.readFileSync(path.join(repoRoot, 'ui/company-config.js'), 'utf8');

  assert.match(runtimeContracts, /const STATE_SCHEMA_VERSION = 14/);
  assert.doesNotMatch(fileStore, /companyRuntime|companyBlueprint|agentProfiles/);
  assert.match(server, /companyBlueprintPath: path\.join\(repoRoot, 'company', 'blueprint\.json'\)/);
  assert.match(server, /companyRepoRoot: repoRoot/);
  assert.doesNotMatch(server, /\/api\/company-profiles|\/api\/staffing-plan/);
  assert.match(companyConfig, /COMPANY_MEMBER_STORAGE_KEY = 'orchestration\.company-members\.v1'/);
  assert.doesNotMatch(companyConfig, /companyRuntime|companyBlueprint|canMutateSource|canCommit|canPush/);

  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        mode: 'ai-company-runtime-blueprint-smoke',
        company: {
          id: blueprint.companyId,
          profileCount: blueprint.agentProfiles.length,
          roleCount: roleNames.length,
          status: configuredSnapshot.companyRuntime.status,
        },
        compatibility: {
          persistedSchemaVersion: persistedState.schemaVersion,
          legacySnapshotUnchanged: true,
          policyPersisted: false,
          deterministicCouncilPreserved: true,
        },
        invalidCases: 12,
        authority: {
          staffingPlanRuntimeAllowed: false,
          councilRoleExecutionAllowed: true,
          providerCallsAllowed: false,
          memoryPersistenceAllowed: false,
          autonomousSchedulingAllowed: false,
          sourceMutationAllowed: false,
          approvalBypassAllowed: false,
          runtimeAgentCommitAllowed: false,
          runtimeAgentPushAllowed: false,
        },
      },
      null,
      2,
    )}\n`,
  );
} finally {
  fs.rmSync(tempRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
}
