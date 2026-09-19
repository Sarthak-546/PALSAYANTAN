import { useParams, useSearchParams } from 'react-router-dom';
import { emergencyScenarios } from '../data/emergencyScenarios';

export const findScenario = (id?: string | null) =>
  emergencyScenarios.find((s) => s.id === id?.toLowerCase()) ?? emergencyScenarios[0];

/**
 * Resolves the scenario from ANY of the URL shapes the app uses:
 *   /ar-first-aid/cpr            (path param)
 *   /ar-first-aid?type=cpr       (Home quick-access buttons)
 *   /first-aid-detail?id=cpr     (detail alias)
 * `fallbackId` is used only when the URL names no scenario at all.
 */
export function useScenario(fallbackId?: string) {
  const { scenario: fromPath } = useParams<{ scenario: string }>();
  const [search] = useSearchParams();
  const scenarioId = fromPath ?? search.get('type') ?? search.get('id') ?? fallbackId;
  const scenario = findScenario(scenarioId);
  return { scenarioId, scenario };
}