import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcServerShared(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.5 13a1.5 1.5 0 0 0-.55.11L17.74 12 20 10.89c.174.072.361.11.55.11a1.5 1.5 0 1 0-1.44-1.9l-3 1.51a1.5 1.5 0 0 0-.55-.11 1.5 1.5 0 1 0 0 3c.189 0 .375-.038.55-.11l3 1.51A1.5 1.5 0 1 0 20.5 13m-15-2h6.59A6 6 0 0 1 18 6h3.65a3.49 3.49 0 0 0-3.15-2h-13a3.5 3.5 0 1 0 0 7m4-4.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2m-4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2m6.59 6.5H5.5a3.5 3.5 0 1 0 0 7h13a3.49 3.49 0 0 0 3.15-2H18a6 6 0 0 1-5.91-5M5.5 17.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
