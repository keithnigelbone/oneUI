import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAceOfSpades(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m13.84 3-.49-.45a2 2 0 0 0-2.7 0l-.49.45C5.63 7.14 3 10.2 3 13.56A5.36 5.36 0 0 0 8.4 19a5.16 5.16 0 0 0 2.28-.59l-1.07 2.14A1 1 0 0 0 10.5 22h3a1 1 0 0 0 .89-1.45l-1.07-2.14a5.16 5.16 0 0 0 2.28.59 5.36 5.36 0 0 0 5.4-5.44c0-3.37-2.63-6.43-7.16-10.56"
          />
    </Svg>
  );
}
