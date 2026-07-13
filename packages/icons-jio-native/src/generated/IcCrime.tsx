import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCrime(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19.48 13.89v-.05l-.5-3A1 1 0 0 0 18 10V9A6 6 0 1 0 6 9v1a1 1 0 0 0-1 .84l-.5 3v.05a4 4 0 1 0 5 0v-.05l-.5-3A1 1 0 0 0 8 10V9a4 4 0 0 1 8 0v1a1 1 0 0 0-1 .84l-.5 3v.05a4 4 0 1 0 5 0zM9 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0m8 2a2 2 0 1 1 0-4 2 2 0 0 1 0 4"
          />
    </Svg>
  );
}
