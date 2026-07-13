import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSmartOutlet(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-9 9a1 1 0 1 1-2 0V8a1 1 0 0 1 2 0zm3 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5-6a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0z"
          />
    </Svg>
  );
}
