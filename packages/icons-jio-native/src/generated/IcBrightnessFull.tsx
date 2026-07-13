import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBrightnessFull(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 7a1 1 0 0 0 1-1V3a1 1 0 0 0-2 0v3a1 1 0 0 0 1 1M7.05 8.46a1 1 0 0 0 .71.3 1 1 0 0 0 .7-.3 1 1 0 0 0 0-1.41L6.34 4.93a1 1 0 0 0-1.41 1.41zm9.19.3a1 1 0 0 0 .71-.3l2.12-2.12a1 1 0 1 0-1.41-1.41l-2.12 2.12a1 1 0 0 0 0 1.41 1 1 0 0 0 .7.3M7 12a1 1 0 0 0-1-1H3a1 1 0 0 0 0 2h3a1 1 0 0 0 1-1m10 3.54a1 1 0 0 0-1.41 0 1 1 0 0 0 0 1.41l2.12 2.12a1 1 0 0 0 1.41 0 1 1 0 0 0 0-1.41zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8m9 3h-3a1 1 0 0 0 0 2h3a1 1 0 0 0 0-2m-9 6a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0v-3a1 1 0 0 0-1-1m-4.95-1.46-2.12 2.12a1 1 0 0 0 0 1.41 1 1 0 0 0 1.41 0L8.46 17a1 1 0 0 0 0-1.41 1 1 0 0 0-1.41-.05"
          />
    </Svg>
  );
}
