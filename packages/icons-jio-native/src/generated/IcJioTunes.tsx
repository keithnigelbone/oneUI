import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcJioTunes(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-1.5 5a1 1 0 0 1-.73 1L13 9.75v5.75a2.5 2.5 0 1 1-2-2.45V8a1 1 0 0 1 .73-1l3.5-1a1 1 0 0 1 1.164.513c.07.139.106.292.106.447z"
          />
    </Svg>
  );
}
