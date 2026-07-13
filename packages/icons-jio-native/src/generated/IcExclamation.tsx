import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcExclamation(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 17a1 1 0 0 0 1-1V3a1 1 0 0 0-2 0v13a1 1 0 0 0 1 1m0 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"
          />
    </Svg>
  );
}
