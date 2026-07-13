import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcUdder(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19.15 13A10 10 0 0 0 22 6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1 10 10 0 0 0 2.85 7l-1.41 1.75a2 2 0 0 0 3.12 2.5l1.61-2c.592.239 1.205.423 1.83.55V19a2 2 0 0 0 4 0v-3.2q.94-.196 1.83-.56l1.61 2A2 2 0 0 0 19 18a2 2 0 0 0 1.56-3.25z"
          />
    </Svg>
  );
}
