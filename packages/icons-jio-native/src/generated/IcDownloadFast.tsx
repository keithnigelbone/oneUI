import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDownloadFast(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7.714 7.71a1.004 1.004 0 1 0-1.42-1.42l-.29.3V3a1 1 0 0 0-2 0v3.59l-.29-.3a1.004 1.004 0 0 0-1.42 1.42l2 2a1 1 0 0 0 1.42 0zm8.83 1.76h-2.67l2-5.48a1.48 1.48 0 0 0-2.54-1.43l-7.7 9.62a2 2 0 0 0 1.54 3.2h2.8L8.164 20a1.48 1.48 0 0 0 2.52 1.48l7.37-8.75a2 2 0 0 0-1.51-3.26"
          />
    </Svg>
  );
}
