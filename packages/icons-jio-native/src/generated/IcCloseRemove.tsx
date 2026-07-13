import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCloseRemove(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m3.71 12.29a1.002 1.002 0 0 1-.325 1.639 1 1 0 0 1-1.095-.219L12 13.41l-2.29 2.3a1 1 0 0 1-1.639-.325 1 1 0 0 1 .219-1.095l2.3-2.29-2.3-2.29a1.004 1.004 0 0 1 1.42-1.42l2.29 2.3 2.29-2.3a1.004 1.004 0 0 1 1.42 1.42L13.41 12z"
          />
    </Svg>
  );
}
