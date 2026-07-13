import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcChevronRightCircle(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m3.21 10.71-4 4a1.002 1.002 0 0 1-1.639-.325 1 1 0 0 1 .219-1.095l3.3-3.29-3.3-3.29a1.004 1.004 0 0 1 1.42-1.42l4 4a1 1 0 0 1 0 1.42"
          />
    </Svg>
  );
}
