import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTimelines(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M4.5 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m0 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M9 7h10a1 1 0 0 0 1.71.71l1-1a1 1 0 0 0 0-1.42l-1-1A1 1 0 0 0 19 5H9a1 1 0 0 0 0 2M4.5 4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m16.21 11.79a1.002 1.002 0 0 0-1.636.326A1 1 0 0 0 19 17H9a1 1 0 0 0 0 2h10a1 1 0 0 0 1.71.71l1-1a1 1 0 0 0 0-1.42zm0-6a1.002 1.002 0 0 0-1.636.326A1 1 0 0 0 19 11H9a1 1 0 0 0 0 2h10a1 1 0 0 0 1.71.71l1-1a1 1 0 0 0 0-1.42z"
          />
    </Svg>
  );
}
