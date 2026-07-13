import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMobileDataOff(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15 4a1 1 0 0 0-2 0v2.76l2-2zM4.71 10.71 9 6.41v4.35l2-2V4a1 1 0 0 0-.62-.92 1 1 0 0 0-1.09.21l-6 6a1.004 1.004 0 0 0 1.42 1.42m16 2.58a1 1 0 0 0-1.42 0L15 17.59v-7.15L20.49 5a1.055 1.055 0 0 0-1.148-1.718q-.194.08-.342.228L3.51 19A1.054 1.054 0 1 0 5 20.49l4-4V20a1 1 0 1 0 2 0v-5.56l2-2V20a1 1 0 0 0 .62.92.84.84 0 0 0 .38.08 1 1 0 0 0 .71-.29l6-6a1 1 0 0 0 0-1.42"
          />
    </Svg>
  );
}
