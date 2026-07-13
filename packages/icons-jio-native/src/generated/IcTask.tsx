import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTask(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 8V6a3 3 0 0 0-3-3h-1.28A2 2 0 0 0 14 2h-4a2 2 0 0 0-1.72 1H7a3 3 0 0 0-3 3v13a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2m-2 11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.28A2 2 0 0 0 10 6h4a2 2 0 0 0 1.72-1H17a1 1 0 0 1 1 1v2h-6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6zm.71-6.79-3 3a1 1 0 0 1-1.42 0l-1-1a1.004 1.004 0 1 1 1.42-1.42l.29.3 2.29-2.3a1.004 1.004 0 1 1 1.42 1.42"
          />
    </Svg>
  );
}
