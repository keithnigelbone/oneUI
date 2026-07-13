import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcShare(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 15a3 3 0 0 0-2.15.91L8 12.27q.008-.135 0-.27.008-.135 0-.27l7.88-3.64A3 3 0 1 0 15 6q-.008.135 0 .27L7.15 9.91a3 3 0 1 0 0 4.18L15 17.73q-.008.135 0 .27a3 3 0 1 0 3-3"
          />
    </Svg>
  );
}
