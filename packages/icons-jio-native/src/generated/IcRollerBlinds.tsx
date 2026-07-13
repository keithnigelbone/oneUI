import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRollerBlinds(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M4 5h1v5.5a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5V5h2v5.5a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5V5h1a1 1 0 1 0 0-2H4a1 1 0 0 0 0 2m16 14h-1v-5.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5V19h-2v-5.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5V19H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
