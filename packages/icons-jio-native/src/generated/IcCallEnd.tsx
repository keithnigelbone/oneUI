import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCallEnd(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 8c-5.29 0-7.72 2.28-8.6 3.4a1.93 1.93 0 0 0-.4 1.2V14a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-1a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-1.4a1.93 1.93 0 0 0-.4-1.2C19.72 10.28 17.29 8 12 8"
          />
    </Svg>
  );
}
