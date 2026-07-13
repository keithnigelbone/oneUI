import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMapLayers(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m2.59 7.91 9 4a1 1 0 0 0 .82 0l9-4a1 1 0 0 0 0-1.82l-9-4a1 1 0 0 0-.82 0l-9 4a1 1 0 0 0 0 1.82m18.82 8.18-1.11-.5-7.08 3.15a3 3 0 0 1-2.44 0L3.7 15.59l-1.11.5a1 1 0 0 0 0 1.82l9 4a1 1 0 0 0 .82 0l9-4a1 1 0 0 0 0-1.82m0-5-1.11-.5-7.08 3.15a3 3 0 0 1-2.44 0L3.7 10.59l-1.11.5a1 1 0 0 0 0 1.82l9 4a1 1 0 0 0 .82 0l9-4a1 1 0 0 0 0-1.82"
          />
    </Svg>
  );
}
