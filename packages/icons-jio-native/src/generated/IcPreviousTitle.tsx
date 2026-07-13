import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPreviousTitle(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M6 4a1 1 0 0 0-1 1v14a1 1 0 1 0 2 0V5a1 1 0 0 0-1-1m11.89.21a2 2 0 0 0-2.09.19l-8 6a2 2 0 0 0 0 3.2l8 6A2 2 0 0 0 19 18V6a2 2 0 0 0-1.11-1.79"
          />
    </Svg>
  );
}
