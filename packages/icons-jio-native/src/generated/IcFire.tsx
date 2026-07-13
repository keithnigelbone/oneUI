import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFire(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m11.73 2.77-.52-.48a1 1 0 0 0-1.7.87 7.9 7.9 0 0 1-.9 4.52A15 15 0 0 1 7 10a7.55 7.55 0 0 0-2 5 6.86 6.86 0 0 0 7 7 6.86 6.86 0 0 0 7-7c0-5.74-5.28-10.46-7.27-12.23M12 20a2.43 2.43 0 0 1-1.81-4.12 3.2 3.2 0 0 0 .51-.83 5.5 5.5 0 0 0 .3-1.55.5.5 0 0 1 .31-.46.47.47 0 0 1 .54.11l.17.15c.68.6 2.48 2.21 2.48 4.2A2.45 2.45 0 0 1 12 20"
          />
    </Svg>
  );
}
