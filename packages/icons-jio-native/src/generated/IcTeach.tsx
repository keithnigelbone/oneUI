import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTeach(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m6.55-1.83a1 1 0 0 0-1.38.28l-1.41 2.1a1 1 0 0 1-.83.45H12a1 1 0 0 0-.71.29l-5 5a1 1 0 0 0 .325 1.639 1 1 0 0 0 1.095-.219L11 9.41v3.35l-3.89 7.79a1 1 0 0 0 .44 1.34A.93.93 0 0 0 8 22a1 1 0 0 0 .89-.55L12 15.24l3.11 6.21A1 1 0 0 0 16 22a.93.93 0 0 0 .45-.11 1 1 0 0 0 .44-1.34L13 12.76V8h1.93a3 3 0 0 0 2.5-1.34l1.4-2.11a1 1 0 0 0-.28-1.38"
          />
    </Svg>
  );
}
