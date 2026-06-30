import { SURFACE_IDS } from './surface-config.js';

export const UI_PREFERENCE_STORAGE_KEY = 'orchestration.ui-preferences.v1';
export const EVIDENCE_DENSITY_OPTIONS = ['standard', 'compact'];
export const DEFAULT_UI_PREFERENCES = {
  evidenceDensity: 'standard',
  preferredProjectId: null,
  recentSurfaces: ['mission'],
  surfaceCounts: {},
};
export const UI_PREFERENCE_PACKET_SCHEMA = 'orchestration.ui-preferences.portable-review.v1';

export function normalizeUiPreferences(entry = {}) {
  const evidenceDensity = EVIDENCE_DENSITY_OPTIONS.includes(entry.evidenceDensity)
    ? entry.evidenceDensity
    : DEFAULT_UI_PREFERENCES.evidenceDensity;
  const recentSurfaces = Array.isArray(entry.recentSurfaces)
    ? entry.recentSurfaces.filter((surface) => SURFACE_IDS.includes(surface)).slice(0, 6)
    : DEFAULT_UI_PREFERENCES.recentSurfaces;
  const surfaceCounts =
    entry.surfaceCounts && typeof entry.surfaceCounts === 'object'
      ? Object.fromEntries(
          Object.entries(entry.surfaceCounts)
            .filter(([surface]) => SURFACE_IDS.includes(surface))
            .map(([surface, count]) => [surface, Number.isFinite(Number(count)) ? Number(count) : 0]),
        )
      : {};

  return {
    evidenceDensity,
    preferredProjectId:
      typeof entry.preferredProjectId === 'string' && entry.preferredProjectId.trim()
        ? entry.preferredProjectId.trim()
        : null,
    recentSurfaces: recentSurfaces.length ? recentSurfaces : DEFAULT_UI_PREFERENCES.recentSurfaces,
    surfaceCounts,
  };
}
