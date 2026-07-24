import path from 'node:path';
import { fileURLToPath } from 'node:url';

import companyBlueprintModule from '../src/runtime/company-blueprint.js';
import councilSessionModule from '../src/runtime/council-sessions.js';
import councilCoordinatorModule from '../src/execution/council-coordinator.js';
import councilLocalStubModule from '../src/execution/providers/council-local-stub-adapter.js';
import fileStoreModule from '../src/runtime/file-store.js';

const { readCompanyBlueprintStatus } = companyBlueprintModule;
const { createRealCouncilSession } = councilSessionModule;
const { createCouncilCoordinator } = councilCoordinatorModule;
const { createCouncilLocalStubAdapter } = councilLocalStubModule;
const { createFileStore } = fileStoreModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function startHistoricalUnboundRealCouncilFixture(options) {
  const runtimeRoot = path.resolve(options.runtimeRoot);
  const companyRepoRoot = path.resolve(options.companyRepoRoot || repoRoot);
  const companyBlueprintPath = path.resolve(
    options.companyBlueprintPath ||
      path.join(companyRepoRoot, 'company', 'blueprint.json'),
  );
  const store = createFileStore({ runtimeRoot });
  const state = store.loadState();
  const mission = state.missions[options.missionId];
  if (!mission) throw new Error(`Mission not found: ${options.missionId}`);
  const project = state.projects[mission.projectId];
  if (!project) throw new Error(`Project not found: ${mission.projectId}`);
  if (mission.councilSessionId && state.councilSessions[mission.councilSessionId]) {
    throw new Error(
      `Mission ${mission.id} already has a council session: ${mission.councilSessionId}`,
    );
  }

  const companyRuntime = readCompanyBlueprintStatus({
    blueprintPath: companyBlueprintPath,
    repoRoot: companyRepoRoot,
  });
  const now = options.now || new Date().toISOString();
  state.sequences.councilSession += 1;
  const councilSession = createRealCouncilSession({
    id: `councilSession-${String(state.sequences.councilSession).padStart(4, '0')}`,
    mission,
    project,
    companyRuntime,
    now,
  });
  const coordinator = createCouncilCoordinator({
    adapter: options.councilAdapter || createCouncilLocalStubAdapter(),
  });
  coordinator.runAttempt({
    session: councilSession,
    blueprint: companyRuntime.blueprint,
    projectPack: project.pack,
    now,
  });

  state.councilSessions[councilSession.id] = councilSession;
  mission.councilSessionId = councilSession.id;
  mission.status = 'aligning';
  mission.updatedAt = now;
  state.activeProjectId = mission.projectId;
  state.selectedMissionId = mission.id;
  store.saveState(state);

  return {
    councilSession: state.councilSessions[councilSession.id],
    mission: state.missions[mission.id],
  };
}
