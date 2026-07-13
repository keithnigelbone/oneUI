import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPlan(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3m-5 4h4a1 1 0 1 1 0 2h-4a1 1 0 1 1 0-2m4 12h-4a1 1 0 0 1 0-2h4a1 1 0 0 1 0 2m0-5h-4a1 1 0 0 1 0-2h4a1 1 0 0 1 0 2M9.5 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0 5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0 5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"
          />
    </Svg>
  );
}
