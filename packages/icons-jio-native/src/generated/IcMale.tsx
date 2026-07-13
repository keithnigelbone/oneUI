import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMale(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M13 10.09V5.41l2.29 2.3a1 1 0 0 0 1.639-.325 1 1 0 0 0-.219-1.095l-4-4a1 1 0 0 0-1.42 0l-4 4a1.004 1.004 0 1 0 1.42 1.42L11 5.41v4.68a6 6 0 1 0 2 0M12 20a4 4 0 1 1 0-8 4 4 0 0 1 0 8"
          />
    </Svg>
  );
}
