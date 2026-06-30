export function formatWorktreeOptionLabel(option) {
  const parts = [option.branch || 'detached', option.path];

  if (option.isCurrentProjectPath) {
    parts.push('현재 프로젝트 경로');
  }

  return parts.join(' · ');
}

export function buildLinkedWorktreeFallbackName(option) {
  const pathParts = String(option?.path || '')
    .split('/')
    .filter(Boolean);

  return option?.branch || pathParts[pathParts.length - 1] || '연결-워크트리';
}
