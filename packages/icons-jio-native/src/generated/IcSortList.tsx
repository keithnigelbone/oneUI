import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSortList(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10 17H4a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m0-6H4a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m8.79 3.29-1.29 1.3V11.5a1 1 0 0 0-2 0v4.09l-1.29-1.3a1.004 1.004 0 1 0-1.42 1.42l3 3a1 1 0 0 0 1.42 0l3-3a1.004 1.004 0 0 0-1.42-1.42M20 5H4a1 1 0 0 0 0 2h16a1 1 0 1 0 0-2"
          />
    </Svg>
  );
}
