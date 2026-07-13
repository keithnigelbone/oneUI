import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWidestRange(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10 11a1 1 0 0 0-1 1v8a1 1 0 1 0 2 0v-8a1 1 0 0 0-1-1m-4 4a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0v-4a1 1 0 0 0-1-1M20.88 3.53A1 1 0 0 0 20 3h-4a1 1 0 0 0-.88.53 1 1 0 0 0 .05 1L17 7.3V20a1 1 0 0 0 2 0V7.3l1.83-2.75a1 1 0 0 0 .05-1.02M14 7a1 1 0 0 0-1 1v12a1 1 0 0 0 2 0V8a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
