import { getNavGroupForSurface, getNavGroupLabel } from './surface-config.js';

export const COMPANY_MEMBER_STORAGE_KEY = 'orchestration.company-members.v1';

export const COMPANY_ROLE_OPTIONS = [
  { value: 'chief-of-staff', label: 'Chief of Staff' },
  { value: 'council-lead', label: 'Council Lead' },
  { value: 'strategist', label: 'Strategist' },
  { value: 'architect', label: 'Architect' },
  { value: 'builder', label: 'Builder' },
  { value: 'reviewer', label: 'Reviewer' },
  { value: 'ops-manager', label: 'Ops Manager' },
];

export const COMPANY_DESK_OPTIONS = [
  { surface: 'mission', label: 'Mission Desk' },
  { surface: 'council', label: 'Council Desk' },
  { surface: 'execution', label: 'Execution Desk' },
  { surface: 'deliverables', label: 'Deliverables Desk' },
  { surface: 'decision-inbox', label: 'Decision Desk' },
  { surface: 'artifacts', label: 'Evidence Desk' },
  { surface: 'logs', label: 'Logs Desk' },
  { surface: 'taskboard', label: 'Operations Desk' },
];

export const OPS_EDITOR_GROUP_DEFAULTS = {
  workflows: {
    role: 'builder',
    surface: 'execution',
  },
  review: {
    role: 'reviewer',
    surface: 'artifacts',
  },
  ops: {
    role: 'ops-manager',
    surface: 'taskboard',
  },
};

export const DEFAULT_COMPANY_MEMBERS = [
  {
    id: 'member-chief',
    name: 'Ari',
    role: 'chief-of-staff',
    surface: 'mission',
  },
  {
    id: 'member-council',
    name: 'Mina',
    role: 'council-lead',
    surface: 'council',
  },
  {
    id: 'member-architect',
    name: 'Joon',
    role: 'architect',
    surface: 'execution',
  },
  {
    id: 'member-builder',
    name: 'Nova',
    role: 'builder',
    surface: 'execution',
  },
  {
    id: 'member-reviewer',
    name: 'Rin',
    role: 'reviewer',
    surface: 'artifacts',
  },
  {
    id: 'member-ops',
    name: 'Sol',
    role: 'ops-manager',
    surface: 'taskboard',
  },
];

export function hasCompanyRole(role) {
  return COMPANY_ROLE_OPTIONS.some((option) => option.value === role);
}

export function hasCompanyDesk(surface) {
  return COMPANY_DESK_OPTIONS.some((option) => option.surface === surface);
}

export function normalizeCompanyMember(entry, index = 0) {
  const role = hasCompanyRole(entry?.role) ? entry.role : 'builder';
  const surface = hasCompanyDesk(entry?.surface) ? entry.surface : 'execution';
  const fallbackName = `Agent ${index + 1}`;

  return {
    id: String(entry?.id || `member-${index + 1}`),
    name: String(entry?.name || fallbackName).trim() || fallbackName,
    role,
    surface,
  };
}

export function getCompanyRoleLabel(role) {
  return COMPANY_ROLE_OPTIONS.find((option) => option.value === role)?.label || 'Builder';
}

export function getCompanyDeskLabel(surface) {
  return COMPANY_DESK_OPTIONS.find((option) => option.surface === surface)?.label || 'Execution Desk';
}

export function getCompanyMembersForGroup(members = [], groupId = null) {
  const groupOrder = ['workflows', 'review', 'ops'];
  const visibleMembers = groupId
    ? members.filter((member) => getNavGroupForSurface(member.surface) === groupId)
    : members;

  return [...visibleMembers].sort((left, right) => {
    const leftGroupIndex = groupOrder.indexOf(getNavGroupForSurface(left.surface));
    const rightGroupIndex = groupOrder.indexOf(getNavGroupForSurface(right.surface));

    if (leftGroupIndex !== rightGroupIndex) {
      return leftGroupIndex - rightGroupIndex;
    }

    const leftDesk = getCompanyDeskLabel(left.surface);
    const rightDesk = getCompanyDeskLabel(right.surface);

    if (leftDesk !== rightDesk) {
      return leftDesk.localeCompare(rightDesk, 'ko');
    }

    return left.name.localeCompare(right.name, 'ko');
  });
}

export function getCompanyDirectorySummary(members = []) {
  const counts = {
    ops: 0,
    review: 0,
    workflows: 0,
  };

  for (const member of members) {
    const groupId = getNavGroupForSurface(member.surface);
    counts[groupId] += 1;
  }

  return counts;
}

export function getOpsEditorGroupLabel(activeGroupId = 'all') {
  return activeGroupId === 'all' ? '전체 회사' : getNavGroupLabel(activeGroupId);
}

export function getOpsEditorMembers(members = [], activeGroupId = 'all') {
  return activeGroupId === 'all'
    ? getCompanyMembersForGroup(members)
    : getCompanyMembersForGroup(members, activeGroupId);
}
