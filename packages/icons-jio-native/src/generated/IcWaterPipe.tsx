import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWaterPipe(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 17.28V14a5 5 0 0 0-5-5V8a1 1 0 0 0-1-1h-1V5h1a1 1 0 1 0 0-2h-4a1 1 0 0 0 0 2h1v2h-1a1 1 0 0 0-1 1v1H6.72A2 2 0 0 0 5 8a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2 2 2 0 0 0 1.72-1H14v2.28A2 2 0 0 0 13 19a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2 2 2 0 0 0-1-1.72"
          />
    </Svg>
  );
}
