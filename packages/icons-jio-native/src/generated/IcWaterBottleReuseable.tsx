import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWaterBottleReuseable(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7 11.27a.93.93 0 0 0 .46.84 1 1 0 0 1 0 1.78.93.93 0 0 0-.46.84V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-5.27a.93.93 0 0 0-.46-.84 1 1 0 0 1 0-1.78.93.93 0 0 0 .46-.84V10H7zM15 5h-1V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v2H9a2 2 0 0 0-2 2v1h10V7a2 2 0 0 0-2-2"
          />
    </Svg>
  );
}
