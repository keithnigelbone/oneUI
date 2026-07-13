import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWebBrowserMobile(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h7v-8a4 4 0 0 1 4-4h4a4 4 0 0 1 2 .56V7a3 3 0 0 0-3-3M5 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2m3 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m3 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m9 2h-4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2m-2 10a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
