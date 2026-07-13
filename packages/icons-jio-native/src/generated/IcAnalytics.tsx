import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAnalytics(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M14 11h8a10 10 0 0 0-9-8.95v8a1 1 0 0 0 1 .95m-3-1V2.05A10 10 0 1 0 22 13h-8a3 3 0 0 1-3-3"
          />
    </Svg>
  );
}
