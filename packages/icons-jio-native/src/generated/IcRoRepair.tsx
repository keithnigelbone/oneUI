import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRoRepair(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7.43 17.25a.45.45 0 0 0-.18-.18.5.5 0 0 0-.68.17l-.89 1.5c-.15.29-.21.617-.17.94.048.323.195.623.42.86q.215.21.49.33a1.46 1.46 0 0 0 1.16 0 1.5 1.5 0 0 0 .49-.33 1.6 1.6 0 0 0 .42-.87 1.57 1.57 0 0 0-.18-.95zM21 3h-4a3 3 0 0 0-3 3v1h-3V6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v5a3 3 0 0 0 2 2.82V15a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1.18A3 3 0 0 0 11 11h2v1a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1h2a1 1 0 0 0 2 0V7a1 1 0 0 0-2 0h-3V6a1 1 0 0 1 1-1h4a1 1 0 1 0 0-2"
          />
    </Svg>
  );
}
