import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSoundMedium(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M11.6 3.8 6 8H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2l5.6 4.2A1.5 1.5 0 0 0 14 19V5a1.5 1.5 0 0 0-2.4-1.2m5.52 6.08a1 1 0 1 0-1.41 1.41 1 1 0 0 1 0 1.42 1 1 0 0 0 0 1.41 1 1 0 0 0 1.41 0 3 3 0 0 0 0-4.24"
          />
    </Svg>
  );
}
