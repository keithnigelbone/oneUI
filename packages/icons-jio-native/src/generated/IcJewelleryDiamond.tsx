import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcJewelleryDiamond(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m21.14 8.66-3.6-4A2 2 0 0 0 16.05 4H8a2 2 0 0 0-1.49.66l-3.6 4a2 2 0 0 0 0 2.68l8.4 9.33a1 1 0 0 0 1.48 0l8.4-9.33a2 2 0 0 0-.05-2.68"
          />
    </Svg>
  );
}
