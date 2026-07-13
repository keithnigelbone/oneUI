import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcThreeDay(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M3 5v14a2 2 0 0 0 2 2h2.67V3H5a2 2 0 0 0-2 2m6.67 16h4.66V3H9.67zM19 3h-2.67v18H19a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2"
          />
    </Svg>
  );
}
