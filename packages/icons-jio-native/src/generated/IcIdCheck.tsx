import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcIdCheck(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 5H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3M8 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m2 8H6a1 1 0 0 1-1-1 3 3 0 0 1 6 0 1 1 0 0 1-1 1m9.71-5.29-4 4a1 1 0 0 1-1.42 0l-2-2a1.004 1.004 0 1 1 1.42-1.42l1.29 1.3 3.29-3.3a1.004 1.004 0 0 1 1.42 1.42"
          />
    </Svg>
  );
}
