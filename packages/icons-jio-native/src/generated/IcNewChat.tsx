import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcNewChat(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15 4H9a7 7 0 0 0-1 13.92V20a1.5 1.5 0 0 0 2.4 1.2l4.27-3.2H15a7 7 0 0 0 0-14m-1 8h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1V9a1 1 0 1 1 2 0v1h1a1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
