import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFlash(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m5.59 12.18 7.7-9.62A1.48 1.48 0 0 1 15.83 4l-2 5.48h2.67a2 2 0 0 1 1.51 3.24l-7.37 8.75A1.48 1.48 0 0 1 8.16 20l1.77-4.6h-2.8a2 2 0 0 1-1.54-3.22"
          />
    </Svg>
  );
}
