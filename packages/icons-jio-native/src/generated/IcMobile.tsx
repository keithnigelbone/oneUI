import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMobile(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15 2H9a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3m-3 18a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5"
          />
    </Svg>
  );
}
