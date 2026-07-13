import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHotspot(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 14H8a3 3 0 0 0-3 3v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4a3 3 0 0 0-3-3m-.82-4.4a1 1 0 1 0 1.6-1.2 6 6 0 0 0-9.56 0 1 1 0 0 0 1.6 1.2 4 4 0 0 1 6.36 0m4.26-4.27a10 10 0 0 0-14.88 0 1.002 1.002 0 0 0 1.49 1.34 8 8 0 0 1 11.9 0 1 1 0 0 0 .75.33 1 1 0 0 0 .66-.26 1 1 0 0 0 .08-1.41M11 11a1 1 0 1 0 2 0 1 1 0 0 0-2 0"
          />
    </Svg>
  );
}
