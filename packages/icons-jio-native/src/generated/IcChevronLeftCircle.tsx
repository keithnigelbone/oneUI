import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcChevronLeftCircle(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m2.21 13.29a1.002 1.002 0 0 1-.325 1.639 1 1 0 0 1-1.095-.219l-4-4a1 1 0 0 1 0-1.42l4-4a1.003 1.003 0 1 1 1.42 1.42L10.91 12z"
          />
    </Svg>
  );
}
