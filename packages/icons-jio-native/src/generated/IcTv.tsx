import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTv(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15 19H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m5-14H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2"
          />
    </Svg>
  );
}
