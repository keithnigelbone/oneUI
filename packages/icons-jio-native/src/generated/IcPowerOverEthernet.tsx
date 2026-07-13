import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPowerOverEthernet(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 3H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1a2 2 0 0 0 2 2h1a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2h1a2 2 0 0 0 2-2h1a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-4.2 8.6-3 4a.999.999 0 1 1-1.6-1.2L12 12h-2a1 1 0 0 1-.89-.55 1 1 0 0 1 .09-1l3-4a1 1 0 1 1 1.6 1.2L12 10h2a1 1 0 0 1 .8 1.6"
          />
    </Svg>
  );
}
