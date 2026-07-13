import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconComponent } from '@oneui/shared';

const IC_HOME =
  'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z';

const IC_SEARCH =
  'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z';

const IC_USER =
  'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z';

const IC_GLOBE =
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z';

const IC_MAIL =
  'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z';

function glyph(path: string): IconComponent {
  return ({ size = 24, color = 'currentColor', fill }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={path} fill={fill ?? color} />
    </Svg>
  );
}

export const IcHomeGlyph = glyph(IC_HOME);
export const IcSearchGlyph = glyph(IC_SEARCH);
export const IcUserGlyph = glyph(IC_USER);
export const IcGlobeGlyph = glyph(IC_GLOBE);
export const IcMailGlyph = glyph(IC_MAIL);
