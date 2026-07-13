import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcLaptopMobile(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8v-7a4 4 0 0 1 4-4h3a3.9 3.9 0 0 1 2 .56V6a3 3 0 0 0-3-3M3 19a1 1 0 0 0 0 2h10.56a3.9 3.9 0 0 1-.56-2zM20 8h-3a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2m-1.5 11a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
