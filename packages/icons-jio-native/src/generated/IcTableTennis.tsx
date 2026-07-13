import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTableTennis(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4M6.22 14l-2.63 2.59a2 2 0 1 0 2.82 2.82l2.94-2.93A7.1 7.1 0 0 0 12 17c.46 0 .92-.047 1.37-.14L5 10.25A7 7 0 0 0 6.22 14M12 3a7 7 0 0 0-6.69 4.93L15.54 16A7 7 0 0 0 12 3"
          />
    </Svg>
  );
}
