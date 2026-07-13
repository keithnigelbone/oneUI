import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcNatureOff(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16.12 3.64A6 6 0 0 0 6 8q.001.561.11 1.11a4 4 0 0 0-2.05 6.59zm1.77 5.47q.108-.549.11-1.11.015-.264 0-.53L20.49 5A1.053 1.053 0 0 0 19 3.51L3.51 19A1.055 1.055 0 0 0 5 20.49L8.44 17H11v3H9a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2h-2v-3h4a4 4 0 0 0 .89-7.89"
          />
    </Svg>
  );
}
