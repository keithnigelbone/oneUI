import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcProtection(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.46 4.68a2 2 0 0 0-1.3-.68 18.8 18.8 0 0 1-6.34-1.83 1.86 1.86 0 0 0-1.64 0A18.5 18.5 0 0 1 4.88 4 2.06 2.06 0 0 0 3 6v5c0 6.74 6.75 11 9 11s9-4.25 9-11V6a2 2 0 0 0-.54-1.32m-4.75 6-4 4a1 1 0 0 1-1.42 0l-2-2a1.004 1.004 0 0 1 1.42-1.42L11 12.59l3.29-3.3a1.004 1.004 0 0 1 1.42 1.42z"
          />
    </Svg>
  );
}
