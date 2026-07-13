import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcOperatingTable(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17.78 8.71c.19.19.44.29.71.29s.52-.11.71-.29c.82-.83 1.01-2.05.57-3.05l.95-.95a.996.996 0 1 0-1.41-1.41l-.94.94a2.76 2.76 0 0 0-3.06.57.996.996 0 0 0 0 1.41l2.49 2.49zM19 11H8.07L6.66 8.89a1.987 1.987 0 0 0-2.77-.55c-.92.61-1.17 1.85-.55 2.77l1.41 2.11A3.98 3.98 0 0 0 8.08 15h2.93v4h-2c-.55 0-1 .45-1 1s.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1h-2v-4h6c1.1 0 2-.9 2-2s-.9-2-2-2z"
          />
    </Svg>
  );
}
