import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCowDeviceOff(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.71 4.71a1.004 1.004 0 1 0-1.42-1.42l-16 16a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l3-3A3 3 0 0 0 9 18h6a3 3 0 0 0 3-3V9a3 3 0 0 0-.3-1.29zM12 14a2 2 0 0 1-.51-.07l2.44-2.44q.066.25.07.51a2 2 0 0 1-2 2M9 6a3 3 0 0 0-3 3v4.76L13.76 6zm-5 9V9H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1zm17-6h-1v6h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
