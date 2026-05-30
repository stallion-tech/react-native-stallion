import {
  parseTokenRegion,
  regionalApiBaseUrl,
  AP_ORIGIN,
  US_ORIGIN,
} from '../main/utils/parseTokenRegion';

describe('parseTokenRegion', () => {
  it('parses stl_ap CI token', () => {
    expect(
      parseTokenRegion('stl_ap_LaTCO8IcJYf6Ga1fFrNjLGfjko9HTlKbaYTS')
    ).toBe('ap');
  });

  it('parses stl_us CI token', () => {
    expect(parseTokenRegion('stl_us_' + 'a'.repeat(36))).toBe('us');
  });

  it('returns null for legacy spb token without region', () => {
    expect(
      parseTokenRegion('spb_qLFBKtdR9TBZtsKPDqMXvFD_ebcs-Tdjyc7F4-dX7q')
    ).toBeNull();
  });

  it('returns null for invalid region code', () => {
    const invalid = 'stl_xx_' + 'a'.repeat(36);
    expect(parseTokenRegion(invalid)).toBeNull();
  });

  it('defaults regional URL to AP when region is null', () => {
    expect(regionalApiBaseUrl(null)).toBe(AP_ORIGIN);
    expect(regionalApiBaseUrl('us')).toBe(US_ORIGIN);
  });
});
