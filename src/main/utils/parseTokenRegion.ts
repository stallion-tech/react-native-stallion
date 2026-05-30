const AP_ORIGIN = 'https://api-ap.stalliontech.io';
const US_ORIGIN = 'https://api-us.stalliontech.io';

const VALID_REGIONS = new Set(['ap', 'us']);

export { AP_ORIGIN, US_ORIGIN, VALID_REGIONS };

/**
 * Parse the region prefix from a Stallion token.
 * Returns 'ap' | 'us' | null. Null means legacy unprefixed token; default to 'ap'.
 */
export function parseTokenRegion(token: unknown): 'ap' | 'us' | null {
  if (typeof token !== 'string') {
    return null;
  }

  const trimmed = token.trim();
  if (!trimmed) {
    return null;
  }

  // App token: spb_<region>_<44-char nanoid> → 49 chars
  if (
    trimmed.startsWith('spb_') &&
    trimmed.length === 49 &&
    trimmed.charAt(6) === '_'
  ) {
    return extractRegion(trimmed);
  }

  // CI token: stl_<region>_<36-char nanoid> → 43 chars
  if (
    trimmed.startsWith('stl_') &&
    trimmed.length === 43 &&
    trimmed.charAt(6) === '_'
  ) {
    return extractRegion(trimmed);
  }

  return null;
}

function extractRegion(token: string): 'ap' | 'us' | null {
  const code = token.substring(4, 6).toLowerCase();
  if (!/^[a-z]{2}$/.test(code)) {
    return null;
  }
  return VALID_REGIONS.has(code) ? (code as 'ap' | 'us') : null;
}

export function regionalApiBaseUrl(region: string | null): string {
  return region === 'us' ? US_ORIGIN : AP_ORIGIN;
}
