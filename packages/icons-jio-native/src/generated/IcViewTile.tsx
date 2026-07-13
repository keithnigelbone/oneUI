import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcViewTile(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 19H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2m0-4H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2M18 3H6a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3"
          />
    </Svg>
  );
}
