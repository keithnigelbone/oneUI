import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWashingMachine(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3M7 4h2a1 1 0 0 1 0 2H7a1 1 0 0 1 0-2m5 16a6 6 0 1 1 0-12 6 6 0 0 1 0 12m5-14a1 1 0 1 1 0-2 1 1 0 0 1 0 2m-5 4a4 4 0 0 0-4 4 1.66 1.66 0 0 1 1.26.56 1 1 0 0 0 1.48 0A1.65 1.65 0 0 1 12 14a1.7 1.7 0 0 1 1.26.56 1 1 0 0 0 1.48 0A1.7 1.7 0 0 1 16 14a4 4 0 0 0-4-4"
          />
    </Svg>
  );
}
