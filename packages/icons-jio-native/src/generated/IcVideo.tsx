import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcVideo(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 5H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3m-4.45 7.83-3 2A1 1 0 0 1 10 14v-4a1 1 0 0 1 .53-.88 1 1 0 0 1 1 .05l3 2a1 1 0 0 1 0 1.66z"
          />
    </Svg>
  );
}
