import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcInfo(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m0 3.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m2 12h-4a1 1 0 0 1 0-2h1v-3h-1a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
