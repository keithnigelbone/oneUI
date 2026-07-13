import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFoodDrink(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M14.71 8.71A1 1 0 0 0 14 7h-2.72l.5-2H13a1 1 0 1 0 0-2h-1.22a2 2 0 0 0-1.23.43 2 2 0 0 0-.71 1.09L9.22 7H4a1 1 0 0 0 0 2h10a1 1 0 0 0 .71-.29M9 16a7.05 7.05 0 0 1 2.1-5H4.3l.7 9.08a1 1 0 0 0 .32.66A1 1 0 0 0 6 21h5.11A7.05 7.05 0 0 1 9 16m11.45-2.27a5 5 0 0 0-2.71-2.41 3.1 3.1 0 0 0 1.26-.76A3.86 3.86 0 0 0 20 8a.51.51 0 0 0-.49-.49 3.4 3.4 0 0 0-1.37.23 3.3 3.3 0 0 0-1.14.8 3.7 3.7 0 0 0-.94 2.46 5 5 0 0 0-1 9.91 5 5 0 0 0 5.74-3.57 5.07 5.07 0 0 0-.34-3.61z"
          />
    </Svg>
  );
}
