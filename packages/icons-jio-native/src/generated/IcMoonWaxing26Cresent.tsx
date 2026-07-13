import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMoonWaxing26Cresent(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2M4 12c0-4.4 3.57-7.98 7.97-8C14.41 5.82 16 8.72 16 12s-1.59 6.18-4.03 8C7.57 19.98 4 16.4 4 12"
          />
    </Svg>
  );
}
