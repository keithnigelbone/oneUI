import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDownloadQueueBottom(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M4 7h6a1 1 0 1 0 0-2H4a1 1 0 0 0 0 2m0 6h6a1 1 0 0 0 0-2H4a1 1 0 0 0 0 2m16.21-2.71a1 1 0 0 0-1.42 0l-1.29 1.3V6a1 1 0 0 0-2 0v5.59l-1.29-1.3a1.004 1.004 0 0 0-1.42 1.42l3 3a1 1 0 0 0 1.42 0l3-3a1 1 0 0 0 0-1.42M19 17H4a1 1 0 0 0 0 2h15a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
