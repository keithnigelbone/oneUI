import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCloudUpload(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15.71 13.21a1 1 0 0 1-1.42 0l-.29-.3v2.59a1 1 0 0 1-2 0v-2.59l-.29.3a1.004 1.004 0 1 1-1.42-1.42l2-2a1 1 0 0 1 1.42 0l2 2a1 1 0 0 1 0 1.42M20 11.54q.015-.27 0-.54A6 6 0 0 0 8.8 8a4 4 0 0 0-3.31 2.1A4.48 4.48 0 0 0 6 19h12a4 4 0 0 0 2-7.46"
          />
    </Svg>
  );
}
