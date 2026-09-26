// EmergencyService.ts
// Centralized service for emergency SMS and phone call functionality

// Indian emergency numbers
export const SOS_NUMBER = '112'; // National unified emergency (Police / Fire / Medical)
export const AMBULANCE_108 = '108'; // Emergency ambulance services
export const NATIONAL_112 = '112'; // National SOS
export const MATERNITY_102 = '102'; // Maternity transport

/**
 * Builds the pre-filled SOS text message.
 * @param fix - Location fix (latitude and longitude) or null if unavailable
 * @param remark - Emergency remark/message
 * @returns SMS URI string
 */
export const buildSosSmsUri = (fix: { lat: number; lon: number } | null | undefined, remark: string): string => {
  const body = fix
    ? `EMERGENCY: ${remark}. Location: https://maps.google.com/?q=${fix.lat.toFixed(6)},${fix.lon.toFixed(6)} (Lat: ${fix.lat.toFixed(6)}, Lng: ${fix.lon.toFixed(6)})`
    : `EMERGENCY: ${remark}. Immediate ambulance required! (GPS unavailable)`;
  // "?&body=" is the form both Android and iOS accept ("?body=" alone fails on iOS).
  return `sms:${SOS_NUMBER}?&body=${encodeURIComponent(body)}`;
};

/**
 * Programmatic click on a detached-then-attached anchor: opens the SMS app or
 * phone dialer without touching the SPA (no reload) and works across browsers.
 * @param uri - The URI to open (sms: or tel:)
 */
export const openExternal = (uri: string): void => {
  const a = document.createElement('a');
  a.href = uri;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};