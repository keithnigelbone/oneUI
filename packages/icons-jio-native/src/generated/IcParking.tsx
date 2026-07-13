import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcParking(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m1.5 11.5h-3v2a1 1 0 0 1-2 0v-7a1 1 0 0 1 1-1h4a3 3 0 1 1 0 6"
          />
          <Path fill={fill} d="M13.5 9.5h-3v2h3a1 1 0 0 0 0-2" />
          <Path
            fill={fill}
            d="M13.5 9.5h-3v2h3a1 1 0 0 0 0-2M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m1.5 11.5h-3v2a1 1 0 0 1-2 0v-7a1 1 0 0 1 1-1h4a3 3 0 1 1 0 6"
          />
    </Svg>
  );
}
