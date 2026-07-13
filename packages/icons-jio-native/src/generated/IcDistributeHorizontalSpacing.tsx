import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDistributeHorizontalSpacing(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 3c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1M4 3.5c-.55 0-1 .45-1 1v15c0 .55.45 1 1 1s1-.45 1-1v-15c0-.55-.45-1-1-1M14 5h-4C8.34 5 7 6.34 7 8v8c0 1.66 1.34 3 3 3h4c1.66 0 3-1.34 3-3V8c0-1.66-1.34-3-3-3"
          />
    </Svg>
  );
}
