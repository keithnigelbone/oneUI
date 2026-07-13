import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBookmarkOff(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17.66 2.08A2.8 2.8 0 0 0 17 2H7c-.8 0-1.56.32-2.12.88S4 4.21 4 5v10.73zM20.29 2.28 4.01 18.56v.02L2.3 20.29a.996.996 0 0 0 .71 1.7c.26 0 .51-.1.71-.29l.62-.62c.17.27.4.49.67.65.3.18.65.27 1 .27s.7-.09 1-.27l5-2.88 5 2.88c.3.18.65.27 1 .27s.7-.09 1-.27.56-.43.73-.73c.18-.3.27-.65.27-1V5.41l1.71-1.71a.996.996 0 1 0-1.41-1.41z"
          />
    </Svg>
  );
}
