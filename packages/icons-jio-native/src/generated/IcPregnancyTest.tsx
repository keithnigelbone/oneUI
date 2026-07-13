import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPregnancyTest(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.41 3.59a2 2 0 0 0-2.3-.38L12.45 6 18 11.55l2.83-5.66a2 2 0 0 0-.42-2.3M4.17 14.17a4.002 4.002 0 0 0 5.66 5.66L16.62 13 11 7.38zm7.54-2.88 1 1a1 1 0 0 1 0 1.42 1 1 0 0 1-1.42 0l-1-1a1.004 1.004 0 0 1 1.42-1.42"
          />
    </Svg>
  );
}
