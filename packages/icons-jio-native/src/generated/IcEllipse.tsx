import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcEllipse(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 20c5.523 0 10-3.582 10-8s-4.477-8-10-8S2 7.582 2 12s4.477 8 10 8"
          />
    </Svg>
  );
}
