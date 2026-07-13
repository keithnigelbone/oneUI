import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcLteDevice(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21.12 4.88A3 3 0 0 0 19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-.88-2.12M12 18a1 1 0 1 1 0-2 1 1 0 0 1 0 2m5-8H7a1 1 0 0 1 0-2h10a1 1 0 1 1 0 2"
          />
    </Svg>
  );
}
