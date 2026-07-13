import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcStream(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M9.6 8.82a1 1 0 0 0-1.2-1.6 6 6 0 0 0 0 9.56A1 1 0 0 0 9 17a1 1 0 0 0 .6-1.8 4 4 0 0 1 0-6.36zM4 12a8 8 0 0 1 3.56-6.61 1.001 1.001 0 0 0-1.12-1.66 9.92 9.92 0 0 0 0 16.54 1 1 0 0 0 1.03.053 1 1 0 0 0 .09-1.713A8 8 0 0 1 4 12m14 0a5.93 5.93 0 0 0-2.4-4.78 1 1 0 1 0-1.2 1.6 4 4 0 0 1 0 6.36 1 1 0 0 0 1.2 1.6A5.93 5.93 0 0 0 18 12m-6-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4m5.56-6.27a1.001 1.001 0 1 0-1.12 1.66 7.92 7.92 0 0 1 0 13.22 1 1 0 1 0 1.12 1.66 9.92 9.92 0 0 0 0-16.54"
          />
    </Svg>
  );
}
