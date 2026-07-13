import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAutoRikshaw(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 5H6.63a3 3 0 0 0-2.94 2.42l-1.63 9A3 3 0 0 0 2 17a3 3 0 0 0 5.82 1h7.36A3 3 0 0 0 21 17V8a3 3 0 0 0-3-3M9 7h6v4h-3a1 1 0 0 0-1 1v4H9zM6.63 7H7v3H5.25l.4-2.2a1 1 0 0 1 .98-.8M5 18a1 1 0 1 1 0-2 1 1 0 0 1 0 2m13 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
