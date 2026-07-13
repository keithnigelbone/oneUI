import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBiology(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.85 3.47A1 1 0 0 0 20 3h-6C7.21 3 3 7.6 3 15c0 2.81.73 4.33 1.63 5.13A.25.25 0 0 0 5 20c.33-6 3.54-10.29 9.57-12.87a1 1 0 1 1 .78 1.84C9.83 11.3 7.09 15.17 7 20.73a.28.28 0 0 0 .27.27C16 20.9 20 15.77 20 11c0-4.59.88-6.51.9-6.56a1 1 0 0 0-.05-.97"
          />
    </Svg>
  );
}
