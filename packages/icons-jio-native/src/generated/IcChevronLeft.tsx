import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcChevronLeft(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M14 17a1 1 0 0 1-.71-.29l-4-4a1 1 0 0 1 0-1.42l4-4a1.005 1.005 0 0 1 1.42 1.42L11.41 12l3.3 3.29a1 1 0 0 1 .219 1.095 1 1 0 0 1-.93.615"
          />
    </Svg>
  );
}
