import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCare(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.71 13.29a1 1 0 0 0-1.42 0L16.59 16H14a1 1 0 0 0 0-2H7.83a2 2 0 0 0-1.42.59l-3.12 3.12a1 1 0 0 0-.29.7V21a1 1 0 0 0 1 1h.59a1 1 0 0 0 .7-.29l1.42-1.42a1 1 0 0 1 .7-.29h7.18a2 2 0 0 0 1.41-.59l4.71-4.7a1 1 0 0 0 0-1.42m-9.57-1.75.22.21A.92.92 0 0 0 12 12a.9.9 0 0 0 .63-.25l.23-.21c2.14-2 3.38-3.4 3.38-5A2.53 2.53 0 0 0 13.69 4a2.62 2.62 0 0 0-1.69.69A2.62 2.62 0 0 0 10.31 4a2.53 2.53 0 0 0-2.55 2.56c0 1.58 1.24 3.02 3.38 4.98"
          />
    </Svg>
  );
}
