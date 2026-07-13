import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDrinks(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M8 20.33A2 2 0 0 0 10 22h6a2 2 0 0 0 2-1.67L19.36 12H6.64zM21 2h-4a1 1 0 0 0-.95.68L15 6h-5a4 4 0 1 0-4 4h13.69L20 8.33a2 2 0 0 0-1.14-2.15A2 2 0 0 0 18 6h-.95l.67-2H21a1 1 0 1 0 0-2M6.47 6.71A2 2 0 0 0 6 8a2 2 0 1 1 2-2 2 2 0 0 0-1.53.71"
          />
    </Svg>
  );
}
