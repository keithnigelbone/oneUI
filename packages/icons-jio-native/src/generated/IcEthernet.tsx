import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcEthernet(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M8 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2m4 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-7.59 1 3.3-3.29a1.004 1.004 0 1 0-1.42-1.42l-4 4a1 1 0 0 0 0 1.42l4 4a1 1 0 0 0 1.639-.325 1 1 0 0 0-.22-1.095zm17.3-.71-4-4a1.004 1.004 0 1 0-1.42 1.42l3.3 3.29-3.3 3.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l4-4a1 1 0 0 0 0-1.42M17 12a1 1 0 1 0-2 0 1 1 0 0 0 2 0"
          />
    </Svg>
  );
}
