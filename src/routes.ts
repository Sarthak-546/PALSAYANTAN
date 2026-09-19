// Single source of truth for every path in the app.
// App.tsx defines routes from this, and pages navigate with it,
// so the two can never drift apart again.
export const ROUTES = {
  home: '/',
  emergencyScan: '/emergency-scan',
  emergencyDetected: '/emergency-detected',
  firstAid: '/first-aid',
  firstAidDetail: '/first-aid-detail',
  arFirstAid: '/ar-first-aid',
  location: '/location',
  settings: '/settings',
} as const;

/** Quick-access deep link, e.g. /ar-first-aid?type=cpr */
export const arFirstAidPath = (type: string) =>
  `${ROUTES.arFirstAid}?type=${encodeURIComponent(type)}`;

/** Library card -> detail page, e.g. /first-aid/cpr */
export const firstAidDetailPath = (id: string) =>
  `${ROUTES.firstAid}/${encodeURIComponent(id)}`;
