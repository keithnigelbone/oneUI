import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcOff(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m1 14a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0z"
          />
    </Svg>
  );
}
