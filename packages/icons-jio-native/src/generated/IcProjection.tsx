import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcProjection(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 14h-1V5h1a1 1 0 1 0 0-2H4a1 1 0 0 0 0 2h1v9H4a1 1 0 0 0 0 2h5.92l-2.7 3.38A1 1 0 0 0 8 21a1 1 0 0 0 .78-.38L11 17.85V20a1 1 0 0 0 2 0v-2.15l2.22 2.77A1 1 0 0 0 16 21a1 1 0 0 0 .78-1.62L14.08 16H20a1 1 0 0 0 0-2m-3.29-4.79a1 1 0 0 1-1.42 0l-.68-.69-2.31 3.08a1 1 0 0 1-.73.4 1.07 1.07 0 0 1-.78-.29l-1.18-1.19-.81 1.08a1 1 0 1 1-1.6-1.2l1.5-2a1 1 0 0 1 1.51-.11l1.18 1.19L13.7 6.4a1 1 0 0 1 1.51-.11l1.5 1.5a1 1 0 0 1 0 1.42"
          />
    </Svg>
  );
}
