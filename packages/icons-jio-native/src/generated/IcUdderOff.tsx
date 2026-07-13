import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcUdderOff(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M3.44 14.75a2 2 0 0 0-.33 1.9L14.76 5H3a1 1 0 0 0-1 1 10 10 0 0 0 2.85 7zM19.15 13A10 10 0 0 0 22 6a1 1 0 0 0-1-1h-.59l.3-.29a1.004 1.004 0 1 0-1.42-1.42l-16 16a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l5-5 .31.08V19a2 2 0 1 0 4 0v-3.2q.94-.196 1.83-.56l1.61 2A2 2 0 0 0 19 18a2 2 0 0 0 1.56-3.25z"
          />
    </Svg>
  );
}
