import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcReplyCircle(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20m-4.71 8.71 2 2a1 1 0 0 0 1.639-.325 1 1 0 0 0-.219-1.095l-.3-.29H13a1.88 1.88 0 0 1 2 2v2a1 1 0 0 0 2 0v-2a3.89 3.89 0 0 0-4-4h-2.59l.3-.29A1.005 1.005 0 0 0 10 6.996a1 1 0 0 0-.71.294l-2 2a1 1 0 0 0 0 1.42"
          />
    </Svg>
  );
}
