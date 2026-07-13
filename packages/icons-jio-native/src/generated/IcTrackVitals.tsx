import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTrackVitals(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15.6 4A5.6 5.6 0 0 0 12 5.46 5.6 5.6 0 0 0 8.4 4 5.36 5.36 0 0 0 3 9.44c0 3.37 2.63 6.43 7.16 10.56l.49.45a2 2 0 0 0 2.7 0l.49-.44C18.37 15.86 21 12.8 21 9.44A5.36 5.36 0 0 0 15.6 4m1.4 8h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 1 1 0-2h1V9a1 1 0 1 1 2 0v1h1a1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
