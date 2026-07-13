import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcOffer(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M9.25 8a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5m5.5 8a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5m1-6.29-6 6a1 1 0 0 1-1.639-.325 1 1 0 0 1 .219-1.095l6-6a1.004 1.004 0 0 1 1.42 1.42"
          />
    </Svg>
  );
}
