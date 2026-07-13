import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcGoogleLens(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18.5 16a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h7a1 1 0 0 0 0-2H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v7a1 1 0 0 0 2 0V6a3 3 0 0 0-3-3m-6 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8"
          />
    </Svg>
  );
}
