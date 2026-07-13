import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDownloadQueue(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21.24 8.17A10 10 0 0 0 9.099 2.427a10 10 0 1 0 12.14 5.743M14 19h-4a1 1 0 0 1 0-2h4a1 1 0 1 1 0 2m1.71-7.29-3 3a1 1 0 0 1-.33.21.94.94 0 0 1-.76 0 1 1 0 0 1-.33-.21l-3-3a1.004 1.004 0 0 1 1.42-1.42l1.29 1.3V6a1 1 0 0 1 2 0v5.59l1.29-1.3a1.004 1.004 0 1 1 1.42 1.42"
          />
    </Svg>
  );
}
