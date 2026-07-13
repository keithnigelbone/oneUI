import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcArtificialInsemination(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 2H6a1 1 0 0 0 0 2h1v13a5 5 0 1 0 10 0V4h1a1 1 0 1 0 0-2m-5.36 9.23A3.08 3.08 0 0 1 14 13.67a2.68 2.68 0 0 1-.7 1.82A2 2 0 1 1 10 17a3 3 0 0 1 1.36-2.43c.51-.43.64-.58.64-.9s-.16-.5-.64-.9A3 3 0 0 1 10 10.33a3 3 0 0 1 1.36-2.43c.48-.4.64-.56.64-.9a1 1 0 0 1 2 0 3.08 3.08 0 0 1-1.36 2.44c-.48.4-.64.56-.64.89s.16.5.64.9"
          />
    </Svg>
  );
}
