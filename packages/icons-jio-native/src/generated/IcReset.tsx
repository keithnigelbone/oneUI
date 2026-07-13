import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcReset(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 4a8 8 0 0 0-8 7.61l-.31-.32a1.004 1.004 0 1 0-1.42 1.42l2 2a1 1 0 0 0 1.42 0l2-2a1.004 1.004 0 1 0-1.42-1.42l-.27.27a6 6 0 1 1 1.8 4.73 1.001 1.001 0 1 0-1.39 1.42A7.92 7.92 0 0 0 12 20a8 8 0 1 0 0-16"
          />
    </Svg>
  );
}
