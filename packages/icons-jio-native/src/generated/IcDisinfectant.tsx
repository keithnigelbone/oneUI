import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDisinfectant(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15 8V7a1 1 0 0 0-1-1h-1V4h.51a2 2 0 0 1 .64.1l2.53.9q.16.021.32 0a1 1 0 0 0 1.05-1.068 1 1 0 0 0-.68-.882l-2.54-.84A3.9 3.9 0 0 0 13.51 2H9a1 1 0 0 0 0 2h2v2h-1a1 1 0 0 0-1 1v1a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3m-1 8h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
