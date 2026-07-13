import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMoreVertical(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m0 10a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m0-6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"
          />
    </Svg>
  );
}
