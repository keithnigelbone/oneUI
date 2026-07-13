import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWeightTraining(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m18.91 6.5 1.8-1.79a1 1 0 0 0-.326-1.639 1 1 0 0 0-1.094.219l-1.79 1.8-1.79-1.8a1 1 0 0 0-1.42 0L13 4.59l-.29-.3a1 1 0 0 0-1.42 0l-1 1a1 1 0 0 0 0 1.41l2.79 2.8-3.55 3.56-2.8-2.79a1 1 0 0 0-1.41 0l-1 1a1 1 0 0 0 0 1.42l.3.29-1.3 1.29a1 1 0 0 0 0 1.42l1.8 1.79-1.8 1.79a1.005 1.005 0 0 0 1.42 1.42l1.79-1.8 1.79 1.8a1 1 0 0 0 1.42 0L11 19.41l.29.3a1 1 0 0 0 1.095.219 1 1 0 0 0 .325-.22l1-1a1 1 0 0 0 0-1.41l-2.79-2.8 3.53-3.53 2.8 2.79a1 1 0 0 0 1.41 0l1-1a1 1 0 0 0 0-1.42l-.3-.29 1.3-1.29a1 1 0 0 0 0-1.42z"
          />
    </Svg>
  );
}
