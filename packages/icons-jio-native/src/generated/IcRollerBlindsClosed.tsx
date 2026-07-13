import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRollerBlindsClosed(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19.5 12h-15a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5m.5-2.5a.5.5 0 0 0-.5-.5h-15a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5zM4 5h16a1 1 0 1 0 0-2H4a1 1 0 0 0 0 2m16 14h-1v-2.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5V19h-2v-2.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5V19H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2m0-12.5a.5.5 0 0 0-.5-.5h-15a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5z"
          />
    </Svg>
  );
}
