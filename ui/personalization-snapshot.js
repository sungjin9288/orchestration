import { normalizeUiPreferences } from './preference-config.js';
import { SURFACE_IDS } from './surface-config.js';

export function getPersonalizationSnapshot({
  activeProject = null,
  currentSurface = 'mission',
  pendingGateCount = 0,
  preferences = {},
  projects = {},
  surfaceLocationGuidance = {},
} = {}) {
  const normalizedPreferences = normalizeUiPreferences(preferences);
  const preferredProject =
    normalizedPreferences.preferredProjectId && projects?.[normalizedPreferences.preferredProjectId]
      ? projects[normalizedPreferences.preferredProjectId]
      : activeProject;
  const recentSurfaces = normalizedPreferences.recentSurfaces.filter((surface) =>
    SURFACE_IDS.includes(surface),
  );
  const frequentSurface =
    Object.entries(normalizedPreferences.surfaceCounts).sort((left, right) => right[1] - left[1])[0]?.[0] ||
    null;
  const fallbackSurface = surfaceLocationGuidance[currentSurface]?.targetSurface || 'mission';
  const suggestedSurface =
    pendingGateCount > 0 ? 'decision-inbox' : frequentSurface || recentSurfaces[0] || fallbackSurface;

  return {
    density: normalizedPreferences.evidenceDensity,
    preferredProject,
    recentSurfaces,
    suggestedSurface,
    visitCount: normalizedPreferences.surfaceCounts[suggestedSurface] || 0,
  };
}
