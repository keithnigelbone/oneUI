import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDirectionsOff(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a9.84 9.84 0 0 0-4.62 1.14L13.24 9h.35l-.3-.29a1.004 1.004 0 0 1 1.42-1.42l2 2a1 1 0 0 1 0 1.42l-.88.88 5 5A9.84 9.84 0 0 0 22 12 10 10 0 0 0 12 2M5 3.51A1.053 1.053 0 1 0 3.51 5l.74.73a10 10 0 0 0 14.06 14.02l.73.74A1.04 1.04 0 0 0 20.49 19zM9 13v2a1 1 0 1 1-2 0v-2a3.76 3.76 0 0 1 1.43-3.12l1.43 1.42A1.8 1.8 0 0 0 9 13"
          />
    </Svg>
  );
}
