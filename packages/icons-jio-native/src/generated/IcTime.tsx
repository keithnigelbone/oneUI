import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTime(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m1 11a1 1 0 0 1-1 1H9a1 1 0 0 1 0-2h2V9a1 1 0 0 1 2 0z"
          />
    </Svg>
  );
}
