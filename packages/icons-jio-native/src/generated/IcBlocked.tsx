import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBlocked(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 0 0-7.74 16.33L18.33 4.26A10 10 0 0 0 12 2m7.74 3.67L5.67 19.74A10 10 0 0 0 19.74 5.67"
          />
    </Svg>
  );
}
