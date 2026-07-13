import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function Ic404Error(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 12a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-1-1m7-8H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m-8 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2M4 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0m4.5 8H8v.5a.5.5 0 0 1-1 0V15H5.5a.52.52 0 0 1-.41-.21.48.48 0 0 1-.09-.45l1-3a.5.5 0 0 1 .94.32L6.19 14H7v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1M8 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2m6 6a2 2 0 0 1-4 0v-1a2 2 0 0 1 4 0zm4.5 1H18v.5a.5.5 0 0 1-1 0V15h-1.5a.52.52 0 0 1-.41-.21.48.48 0 0 1-.06-.45l1-3a.5.5 0 1 1 .94.32L16.19 14H17v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1"
          />
    </Svg>
  );
}
