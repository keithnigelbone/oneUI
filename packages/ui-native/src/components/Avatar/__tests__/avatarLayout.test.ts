import { describe, it, expect } from 'vitest';
import { buildNativeDimensions } from '@oneui/shared/engine';
import { getAvatarContainerSide, getAvatarIconSide } from '../avatarLayout';

describe('avatarLayout — S default density', () => {
  const { spacing } = buildNativeDimensions({ platform: 'S', density: 'default' });

  it('matches web container sizes (Spacing-2 through Spacing-10)', () => {
    expect(getAvatarContainerSide(spacing, '2xs')).toBe(spacing['2']);
    expect(getAvatarContainerSide(spacing, 'xs')).toBe(spacing['3']);
    expect(getAvatarContainerSide(spacing, 's')).toBe(spacing['4']);
    expect(getAvatarContainerSide(spacing, 'm')).toBe(spacing['5']);
    expect(getAvatarContainerSide(spacing, 'l')).toBe(spacing['6']);
    expect(getAvatarContainerSide(spacing, 'xl')).toBe(spacing['8']);
    expect(getAvatarContainerSide(spacing, '2xl')).toBe(spacing['10']);
  });

  it('matches web icon svg sizes (Spacing-2-5 through Spacing-8)', () => {
    const container2xs = spacing['2'];
    expect(getAvatarIconSide(spacing, '2xs', container2xs)).toBe(container2xs);
    expect(getAvatarIconSide(spacing, 'xs', spacing['3'])).toBe(spacing['2-5']);
    expect(getAvatarIconSide(spacing, 'm', spacing['5'])).toBe(spacing['4']);
    expect(getAvatarIconSide(spacing, '2xl', spacing['10'])).toBe(spacing['8']);
  });

  it('custom size uses 2/3 icon ratio', () => {
    expect(getAvatarContainerSide(spacing, 'custom', 60)).toBe(60);
    expect(getAvatarIconSide(spacing, 'custom', 60, 60)).toBe(40);
  });
});
