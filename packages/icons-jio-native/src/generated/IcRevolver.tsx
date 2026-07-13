import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRevolver(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M5.64 16.24a1.5 1.5 0 1 0 2.194 2.045A1.5 1.5 0 0 0 5.64 16.24m0-10.6a1.49 1.49 0 0 0 0 2.12 1.5 1.5 0 0 0 2.12-2.12 1.49 1.49 0 0 0-2.12 0M6 12a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0m12.36-4.24a1.5 1.5 0 1 0-2.195-2.045A1.5 1.5 0 0 0 18.36 7.76M12 18a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m4.24-1.76a1.51 1.51 0 0 0 0 2.12 1.5 1.5 0 0 0 2.12-2.12 1.51 1.51 0 0 0-2.12 0m3.26-5.74a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M12 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"
          />
    </Svg>
  );
}
