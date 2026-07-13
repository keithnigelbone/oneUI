import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcControler(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M6.38 9.08a1 1 0 0 0-1.09.21l-2 2a1 1 0 0 0 0 1.41l2 2A1 1 0 0 0 6 15a.84.84 0 0 0 .38-.08A1 1 0 0 0 7 14v-4a1 1 0 0 0-.62-.92M10 7h4a1 1 0 0 0 .93-.62 1 1 0 0 0-.23-1.08l-2-2A1.08 1.08 0 0 0 12 3a1 1 0 0 0-.7.29l-2 2A1 1 0 0 0 10 7m4 10h-4a1 1 0 0 0-.71 1.7l2 2c.191.185.444.292.71.3a1 1 0 0 0 .71-.29l2-2A1 1 0 0 0 14 17m6.71-5.68-2-2A1 1 0 0 0 17 10v4a1 1 0 0 0 1 1 1 1 0 0 0 .71-.29l2-2A1 1 0 0 0 21 12a1 1 0 0 0-.3-.68zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6"
          />
    </Svg>
  );
}
