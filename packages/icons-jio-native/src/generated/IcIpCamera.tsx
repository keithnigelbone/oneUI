import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcIpCamera(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2m3 10h-2v-2.08a7 7 0 1 0-2 0V18H9a3 3 0 0 0-3 3 1 1 0 0 0 1 1h10a1 1 0 0 0 1-1 3 3 0 0 0-3-3M9 9a3 3 0 1 1 6 0 3 3 0 0 1-6 0"
          />
    </Svg>
  );
}
