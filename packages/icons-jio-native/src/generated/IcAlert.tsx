import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAlert(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m21.74 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.74-3M11 7a1 1 0 0 1 2 0v6a1 1 0 1 1-2 0zm1 12a1.5 1.5 0 1 1 0-2.999 1.5 1.5 0 0 1 0 3"
          />
    </Svg>
  );
}
