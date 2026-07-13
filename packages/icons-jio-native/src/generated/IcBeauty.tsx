import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBeauty(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 11h-2a3 3 0 0 0-3 3v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a3 3 0 0 0-3-3m-8-7a1 1 0 0 0-.55-.89 1 1 0 0 0-1 .09l-4 3A1 1 0 0 0 4 7v4h6zm0 9H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
