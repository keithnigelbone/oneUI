import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBack(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15 20a1 1 0 0 1-.71-.29l-7-7a1 1 0 0 1 0-1.42l7-7a1.005 1.005 0 0 1 1.42 1.42L9.41 12l6.3 6.29a1 1 0 0 1 .219 1.095 1 1 0 0 1-.93.615"
          />
    </Svg>
  );
}
