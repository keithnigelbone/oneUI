import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcGas(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 6V4a1 1 0 1 0 0-2H8a1 1 0 0 0 0 2v2a3 3 0 0 0-3 3v8a3 3 0 0 0 2 2.82A1 1 0 0 0 7 20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2q.008-.09 0-.18A3 3 0 0 0 19 17V9a3 3 0 0 0-3-3m-3 0h-2a1 1 0 1 1 0-2h2a1 1 0 1 1 0 2"
          />
    </Svg>
  );
}
