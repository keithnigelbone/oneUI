import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDay(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 19H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2M4 5h16a1 1 0 1 0 0-2H4a1 1 0 0 0 0 2m15 2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"
          />
    </Svg>
  );
}
