'use strict';

const fs = require('fs');
const path = require('path');

const { createEmptyState } = require('./contracts');

function createFileStore(options = {}) {
  const runtimeRoot = options.runtimeRoot || path.join(process.cwd(), 'var', 'runtime');
  const statePath = path.join(runtimeRoot, 'state.json');
  const logsDir = path.join(runtimeRoot, 'logs');
  const artifactsDir = path.join(runtimeRoot, 'artifacts');

  function ensureDirs() {
    fs.mkdirSync(logsDir, { recursive: true });
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  function ensureStateFile() {
    ensureDirs();

    if (!fs.existsSync(statePath)) {
      fs.writeFileSync(statePath, `${JSON.stringify(createEmptyState(), null, 2)}\n`);
    }
  }

  function loadState() {
    ensureStateFile();
    return JSON.parse(fs.readFileSync(statePath, 'utf8'));
  }

  function saveState(state) {
    ensureDirs();
    fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
  }

  function appendLogRecord(runId, record) {
    ensureDirs();
    const logPath = path.join(logsDir, `${runId}.jsonl`);
    fs.appendFileSync(logPath, `${JSON.stringify(record)}\n`);
    return logPath;
  }

  function readLogRecords(runId) {
    const logPath = path.join(logsDir, `${runId}.jsonl`);

    if (!fs.existsSync(logPath)) {
      return [];
    }

    return fs
      .readFileSync(logPath, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  }

  function writeArtifact(filename, content) {
    ensureDirs();
    const artifactPath = path.join(artifactsDir, filename);
    fs.writeFileSync(artifactPath, content);
    return artifactPath;
  }

  function readArtifact(filename) {
    const artifactPath = path.join(artifactsDir, filename);
    return fs.readFileSync(artifactPath, 'utf8');
  }

  function reset() {
    fs.rmSync(runtimeRoot, { recursive: true, force: true });
    ensureStateFile();
  }

  return {
    appendLogRecord,
    artifactsDir,
    loadState,
    logsDir,
    readArtifact,
    readLogRecords,
    reset,
    runtimeRoot,
    saveState,
    statePath,
    writeArtifact,
  };
}

module.exports = {
  createFileStore,
};
