import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDataInOutNone(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10.29 14.29 8 16.59V6a1 1 0 0 0-2 0v10.59l-2.29-2.3a1.004 1.004 0 1 0-1.42 1.42l4 4a1 1 0 0 0 1.42 0l4-4a1 1 0 0 0 .219-1.095 1 1 0 0 0-.22-.325 1 1 0 0 0-1.42 0m11.42-6-4-4a1 1 0 0 0-1.42 0l-4 4a1 1 0 0 0 .325 1.639 1 1 0 0 0 1.095-.22L16 7.41V18a1 1 0 1 0 2 0V7.41l2.29 2.3a1.004 1.004 0 0 0 1.42-1.42"
            opacity={0.2}
          />
    </Svg>
  );
}
