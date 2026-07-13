import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcStory(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h11a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2M9.1 8l1.47-.22.66-1.33a.86.86 0 0 1 1.54 0l.66 1.33L14.9 8a.86.86 0 0 1 .48 1.46l-1.07 1 .25 1.54a.85.85 0 0 1-1.24.9L12 12.21l-1.32.69a.85.85 0 0 1-1.24-.9l.25-1.47-1.07-1A.86.86 0 0 1 9.1 8M18 19.67a.33.33 0 0 1-.33.33H7a1 1 0 0 1 0-2h10.67a.33.33 0 0 1 .33.33z"
          />
    </Svg>
  );
}
