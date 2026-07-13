import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHandcuffs(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16.5 2a5.49 5.49 0 0 0-4.89 3H11a1 1 0 0 0-1 1v.5h-.5a3 3 0 0 0-3 3v.5H6a1 1 0 0 0-1 1v.61a5.5 5.5 0 1 0 5 0V11a1 1 0 0 0-1-1h-.5v-.5a1 1 0 0 1 1-1h.5V9a1 1 0 0 0 1 1h.61a5.5 5.5 0 1 0 4.89-8M11 16.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m5.5-5.5a3.5 3.5 0 1 1 0-7.002 3.5 3.5 0 0 1 0 7.002"
          />
    </Svg>
  );
}
