import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcServerInternet(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 13h-1.86a4 4 0 1 0 0-2H16a1 1 0 0 1 0 2m-3.91 0H5.5a3.5 3.5 0 1 0 0 7h13a3.49 3.49 0 0 0 3.15-2H18a6 6 0 0 1-5.91-5M5.5 17.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m-4-6.5h6.59A6 6 0 0 1 18 6h3.65a3.49 3.49 0 0 0-3.15-2h-13a3.5 3.5 0 1 0 0 7m4-4.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2m-4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"
          />
    </Svg>
  );
}
