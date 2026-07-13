import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWebBrowser(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m-8 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2M8 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2M5 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"
          />
    </Svg>
  );
}
