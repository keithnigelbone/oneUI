import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRefund(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7.71 11.29a1 1 0 0 0-1.42 0l-.22.22a6 6 0 0 1 10.22-3.75 1.004 1.004 0 1 0 1.42-1.42 8 8 0 0 0-13.64 5.31l-.36-.36a1.004 1.004 0 1 0-1.42 1.42l2 2a1 1 0 0 0 1.42 0l2-2a1 1 0 0 0 0-1.42m14 0-2-2a1 1 0 0 0-1.42 0l-2 2a1.005 1.005 0 0 0 1.42 1.42l.27-.27A6 6 0 0 1 12 18a5.93 5.93 0 0 1-4.24-1.76 1.004 1.004 0 1 0-1.42 1.42A8 8 0 0 0 20 12.39l.31.32a1 1 0 0 0 1.42 0 1 1 0 0 0-.02-1.42"
          />
    </Svg>
  );
}
