import { describe, expect, it } from 'vitest';
import {
  normalizeRenderDensity,
  normalizeRenderPlatform,
  renderPlatformForViewportWidth,
  renderPlatformForOutputProfile,
} from './renderContext';

describe('render context normalization', () => {
  it('maps composition density names to foundation density ids', () => {
    expect(normalizeRenderDensity('compact')).toBe('compact');
    expect(normalizeRenderDensity('comfortable')).toBe('default');
    expect(normalizeRenderDensity('editorial')).toBe('open');
    expect(normalizeRenderDensity('default')).toBe('default');
  });

  it('maps output profiles to unified platform breakpoint ids', () => {
    expect(renderPlatformForOutputProfile('web-desktop')).toBe('L');
    expect(renderPlatformForOutputProfile('web-mobile')).toBe('S');
    expect(renderPlatformForOutputProfile('dashboard-wide')).toBe('L');
    expect(normalizeRenderPlatform('web-desktop')).toBe('L');
    // Legacy `<Letter>-<width>` ids coerce by parsing the width suffix.
    expect(normalizeRenderPlatform('Legacy-1440')).toBe('L');
    expect(normalizeRenderPlatform('Legacy-360')).toBe('S');
  });

  it('maps the live browser width to the nearest unified platform breakpoint', () => {
    expect(renderPlatformForViewportWidth(390)).toBe('S');
    expect(renderPlatformForViewportWidth(619)).toBe('S');
    expect(renderPlatformForViewportWidth(620)).toBe('M');
    expect(renderPlatformForViewportWidth(768)).toBe('M');
    expect(renderPlatformForViewportWidth(990)).toBe('M');
    expect(renderPlatformForViewportWidth(991)).toBe('L');
    expect(renderPlatformForViewportWidth(1024)).toBe('L');
    expect(renderPlatformForViewportWidth(1440)).toBe('L');
    expect(renderPlatformForViewportWidth(1920)).toBe('L');
  });
});
