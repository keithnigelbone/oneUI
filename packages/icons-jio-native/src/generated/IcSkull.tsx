import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSkull(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a8.51 8.51 0 0 0-8.5 8.5c0 2.82.38 5.32 2.5 6.86V20a2 2 0 0 0 2 2h1v-2a1 1 0 1 1 2 0v2h2v-2a1 1 0 0 1 2 0v2h1a2 2 0 0 0 2-2v-2.64c2.12-1.54 2.5-4 2.5-6.86A8.51 8.51 0 0 0 12 2M8.5 15a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m7 0a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5"
          />
    </Svg>
  );
}
