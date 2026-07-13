import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPlanAdd(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16.17 8A1 1 0 0 1 16 8h-4a1 1 0 1 1 0-2h2.17a3 3 0 0 1 2-3.87.5.5 0 0 1 .01-.13H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V9.83A3 3 0 0 1 16.17 8M8 18.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m0-5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m0-5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m8 9.5h-4a1 1 0 0 1 0-2h4a1 1 0 0 1 0 2m0-5h-4a1 1 0 0 1 0-2h4a1 1 0 0 1 0 2m5-9h-1V3a1 1 0 0 0-1-1 1 1 0 0 0-.92.62A.9.9 0 0 0 18 3v1h-1a1 1 0 1 0 0 2h1v1a1 1 0 0 0 2 0V6h1a1 1 0 1 0 0-2"
          />
    </Svg>
  );
}
