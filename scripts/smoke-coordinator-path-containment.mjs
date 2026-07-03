import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import pathsModule from '../src/execution/coordinator/paths.js';
import diffModule from '../src/execution/coordinator/diff.js';

const { resolveProjectFilePath, normalizeRelativePath } = pathsModule;
const { restoreFileContents } = diffModule;

// Isolated project + a sibling "outside" tree the project must never reach.
const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'coordinator-path-containment-')));
const projectPath = path.join(root, 'worktree');
fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });
const outsideDir = path.join(root, 'outside');
fs.mkdirSync(outsideDir, { recursive: true });
const outsideSecret = path.join(outsideDir, 'secret.txt');
fs.writeFileSync(outsideSecret, 'OUTSIDE-SECRET\n');

// A symlink whose lexical path is inside the project but whose real target escapes.
fs.symlinkSync('../../outside/secret.txt', path.join(projectPath, 'src', 'escape-link.js'));
// A symlinked directory that escapes the project.
fs.symlinkSync(outsideDir, path.join(projectPath, 'escape-dir'));
// A legitimate in-project symlink (real target stays inside the project).
fs.writeFileSync(path.join(projectPath, 'src', 'real.js'), 'REAL\n');
fs.symlinkSync('real.js', path.join(projectPath, 'src', 'inside-link.js'));

// 1) Lexical escapes still rejected.
assert.throws(
  () => resolveProjectFilePath(projectPath, '../escape.js'),
  /escapes project_path/,
);
assert.throws(
  () => resolveProjectFilePath(projectPath, '/etc/passwd'),
  /escapes project_path/,
);

// 2) Symlink at the target that escapes is rejected (write-over case).
assert.throws(
  () => resolveProjectFilePath(projectPath, 'src/escape-link.js'),
  /escapes project_path/,
);

// 3) A new file UNDER a symlinked-out directory is rejected (ancestor escape).
assert.throws(
  () => resolveProjectFilePath(projectPath, 'escape-dir/new.js'),
  /escapes project_path/,
);

// 4) In-project symlink is still allowed and reads its real target.
const insideLinkPath = resolveProjectFilePath(projectPath, 'src/inside-link.js');
assert.equal(fs.readFileSync(insideLinkPath, 'utf8').trim(), 'REAL');

// 5) Normal in-project path resolves and a new file resolves cleanly.
const normalPath = resolveProjectFilePath(projectPath, 'src/new.js');
assert.ok(normalPath.startsWith(`${projectPath}${path.sep}`));

// 6) restoreFileContents (the builder-live-mutation write path) must not follow an
//    escaping symlink to write outside the project; the outside file stays intact.
assert.throws(
  () => restoreFileContents(projectPath, new Map([['src/escape-link.js', 'PWNED-VIA-RESTORE\n']])),
  /escapes project_path/,
);
assert.equal(fs.readFileSync(outsideSecret, 'utf8'), 'OUTSIDE-SECRET\n');

// 7) restoreFileContents still writes a normal in-project file.
restoreFileContents(projectPath, new Map([['src/new.js', 'NEW-CONTENT\n']]));
assert.equal(fs.readFileSync(path.join(projectPath, 'src', 'new.js'), 'utf8'), 'NEW-CONTENT\n');

// 8) normalizeRelativePath still rejects traversal and Windows-drive inputs.
assert.equal(normalizeRelativePath('../escape'), null);
assert.equal(normalizeRelativePath('C:/windows'), null);
assert.equal(normalizeRelativePath('src/ok.js'), 'src/ok.js');

fs.rmSync(root, { recursive: true, force: true });

console.log(
  JSON.stringify(
    {
      ok: true,
      escapingSymlinkTargetRejected: true,
      escapingSymlinkDirRejected: true,
      inProjectSymlinkAllowed: true,
      restoreFileContentsEscapeBlocked: true,
      outsideFileIntact: true,
      normalWriteWorks: true,
    },
    null,
    2,
  ),
);
