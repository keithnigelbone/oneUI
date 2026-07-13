import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCloudOff(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M14 5a6 6 0 0 0-5.2 3 4 4 0 0 0-3.31 2.1A4.5 4.5 0 0 0 2 14.5a4.4 4.4 0 0 0 .77 2.5L14.71 5.05A6 6 0 0 0 14 5m6 6.54q.015-.27 0-.54a6 6 0 0 0-1.55-4l2-2a1.038 1.038 0 0 0-.314-1.7A1.04 1.04 0 0 0 19 3.51L3.51 19A1.054 1.054 0 1 0 5 20.49L6.44 19H18a4 4 0 0 0 2-7.46"
          />
    </Svg>
  );
}
