import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcVideoOutgoing(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m19.6 7.8-2.6 2V9a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-.75l2.6 1.95A1.5 1.5 0 0 0 22 15V9a1.5 1.5 0 0 0-2.4-1.2M15 12a1 1 0 0 1-2 0v-.59l-2.29 2.3a1.002 1.002 0 0 1-1.639-.325 1 1 0 0 1 .219-1.095l2.3-2.29H11a1 1 0 1 1 0-2h3a1 1 0 0 1 .38.08 1 1 0 0 1 .54.54c.051.12.078.25.08.38z"
          />
    </Svg>
  );
}
