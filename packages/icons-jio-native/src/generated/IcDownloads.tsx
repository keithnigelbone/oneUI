import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDownloads(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M22 12a10 10 0 1 0-20 0 10 10 0 0 0 20 0m-10.71 4.71-3-3a1 1 0 0 1 .325-1.639 1 1 0 0 1 1.095.219l1.29 1.3V8a1 1 0 0 1 2 0v5.59l1.29-1.3a1.004 1.004 0 1 1 1.42 1.42l-3 3a1 1 0 0 1-.33.21 1 1 0 0 1-.76 0 1 1 0 0 1-.33-.21"
          />
    </Svg>
  );
}
