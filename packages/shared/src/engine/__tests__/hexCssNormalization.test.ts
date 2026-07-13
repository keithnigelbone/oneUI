import { describe, expect, it } from 'vitest';
import {
  normalizeSolidCssHex,
  parseRgbFromHexLoose,
} from '../colorMath';

describe('parseRgbFromHexLoose — ARGB-packed vs CSS #RRGGBBAA', () => {
  it('treats #FFE62828 as Flutter/Skia opaque red (matches Flutter oneUiHexColor)', () => {
    expect(parseRgbFromHexLoose('#FFE62828')).toEqual([0xe6, 0x28, 0x28]);
    expect(normalizeSolidCssHex('#FFE62828')).toBe('#e62828');
  });

  it('keeps opaque CSS #RRGGBBFF as full RGB channels', () => {
    expect(normalizeSolidCssHex('#E62828FF')).toBe('#e62828');
  });

  it('parses translucent CSS mid-alpha (#FFEEDD80) as RR GG BB ignoring alpha slot for RGB tuple', () => {
    expect(parseRgbFromHexLoose('#FFEEDD80')).toEqual([0xff, 0xee, 0xdd]);
    expect(normalizeSolidCssHex('#FFEEDD80')).toBe('#ffeedd');
  });

  it('near-white translucent #FFFFFF3F does not collapse to ARGB opaque white', () => {
    expect(parseRgbFromHexLoose('#FFFFFF3F')).toEqual([0xff, 0xff, 0xff]);
    expect(normalizeSolidCssHex('#FFFFFF3F')).toBe('#ffffff');
  });

  it('6-digit opaque unchanged aside from casing', () => {
    expect(normalizeSolidCssHex('#aa0011')).toBe('#aa0011');
  });

  it('ARGB opaque blues with high B-channel (#FF0053C8 → Reliance / Jio style)', () => {
    expect(parseRgbFromHexLoose('#FF0053C8')).toEqual([0x00, 0x53, 0xc8]);
    expect(normalizeSolidCssHex('#FF0053C8')).toBe('#0053c8');
  });
});
