import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMedicines(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M4 7h1v1a1 1 0 1 0 2 0V7h1a1 1 0 0 0 0-2H7V4a1 1 0 0 0-2 0v1H4a1 1 0 0 0 0 2m16-2a4.44 4.44 0 0 0-6.43-.42l-4 3.6 6.29 6.29 3.71-3.36A4.44 4.44 0 0 0 20 5M4.4 12.89a4.44 4.44 0 1 0 6 6.53l4-3.6-6.29-6.29z"
          />
    </Svg>
  );
}
