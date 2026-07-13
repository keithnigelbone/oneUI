import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCallWifi(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-.38 3.86a2 2 0 0 0-2.83 0l-.7.71a1 1 0 0 1-1.42 0l-4.24-4.24a1 1 0 0 1 0-1.42l.71-.7a2 2 0 0 0 0-2.83l-.71-.71a2 2 0 0 0-2.83 0l-1 1a2 2 0 0 0-.56 1.13c-.16 1.4-.04 4.74 3.68 8.48s7.08 3.84 8.49 3.72a2 2 0 0 0 1.13-.56l1-1a2 2 0 0 0 0-2.83zm5.94-10.17a10.14 10.14 0 0 0-11.11 0A1 1 0 0 0 11 7.52a.94.94 0 0 0 .55-.17 8.11 8.11 0 0 1 8.89 0 1 1 0 0 0 1.12-1.66M19 8.86a5.81 5.81 0 0 0-6.07 0 1 1 0 0 0 1 1.72 3.8 3.8 0 0 1 4 0 1 1 0 0 0 1.37-.35 1 1 0 0 0-.3-1.37"
          />
    </Svg>
  );
}
