import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWebBrowserCursor(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m21.39 16.08-3.5-1.5a1 1 0 0 0-1.31 1.31l1.5 3.5A1 1 0 0 0 19 20h.2a1 1 0 0 0 .8-1v-1h1a1 1 0 0 0 .39-1.92M19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a5 5 0 0 1 7-7V7a3 3 0 0 0-3-3M5 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2m3 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m3 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
