import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFeedback(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 4H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h3v1a2 2 0 0 0 3.2 1.6l3.47-2.6H19a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3M7 8h3a1 1 0 1 1 0 2H7a1 1 0 0 1 0-2m10 6H7a1 1 0 0 1 0-2h10a1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
