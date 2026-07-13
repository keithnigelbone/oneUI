import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCloudSynced(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m15.71 11.71-4 4a1 1 0 0 1-1.42 0l-2-2a1.004 1.004 0 0 1 1.42-1.42l1.29 1.3 3.29-3.3a1.004 1.004 0 0 1 1.42 1.42m4.29-.17q.015-.27 0-.54A6 6 0 0 0 8.8 8a4 4 0 0 0-3.31 2.1A4.48 4.48 0 0 0 6 19h12a4 4 0 0 0 2-7.46"
          />
    </Svg>
  );
}
