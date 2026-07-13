import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcReturn(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m1.5 14H9.41l.3.29a1.004 1.004 0 1 1-1.42 1.42l-2-2a1 1 0 0 1 0-1.42l2-2a1 1 0 0 1 1.639.325 1 1 0 0 1-.219 1.095l-.3.29h4.09a2.5 2.5 0 0 0 0-5H10a1 1 0 0 1 0-2h3.5a4.5 4.5 0 1 1 0 9"
          />
    </Svg>
  );
}
