import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcToddler(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 11h-.07A8 8 0 0 0 12 4a7.7 7.7 0 0 0-1.45.14l-.84-.85a1.004 1.004 0 0 0-1.42 1.42l.14.14A8 8 0 0 0 4.07 11H4a1 1 0 0 0 0 2h.07a8 8 0 0 0 15.86 0H20a1 1 0 1 0 0-2m-13-.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m8.28 5.25a4.93 4.93 0 0 1-6.56 0 1 1 0 0 1 .094-1.57A1 1 0 0 1 9.38 14h5.24a1 1 0 0 1 .966 1.242 1 1 0 0 1-.306.508M15.5 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
          />
    </Svg>
  );
}
