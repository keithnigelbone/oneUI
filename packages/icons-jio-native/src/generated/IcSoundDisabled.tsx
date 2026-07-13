import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSoundDisabled(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M11.6 3.8 6 8H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2l5.6 4.2A1.5 1.5 0 0 0 14 19V5a1.5 1.5 0 0 0-2.4-1.2m8.81 8.2 1.3-1.29a1.005 1.005 0 0 0-1.42-1.42L19 10.59l-1.29-1.3a1.004 1.004 0 0 0-1.42 1.42l1.3 1.29-1.3 1.29a1.002 1.002 0 0 0 .325 1.639 1 1 0 0 0 1.095-.219l1.29-1.3 1.29 1.3a1.002 1.002 0 0 0 1.639-.325 1 1 0 0 0-.219-1.095z"
          />
    </Svg>
  );
}
