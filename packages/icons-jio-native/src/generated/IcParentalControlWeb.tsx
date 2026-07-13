import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcParentalControlWeb(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 16a4 4 0 0 1-4-4v-1H2v6a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-1.55a4 4 0 0 1-2 .55zm-4-9a6 6 0 0 1 .81-3H5a3 3 0 0 0-3 3v2h10zM5 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2m3 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m13-1.72V6a3 3 0 0 0-6 0v.27A2 2 0 0 0 14 8v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V8a2 2 0 0 0-1-1.72M18 11a1 1 0 1 1 0-2 1 1 0 0 1 0 2m-1-5a1 1 0 0 1 2 0z"
          />
    </Svg>
  );
}
