import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTimeline(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M4 15v2a1 1 0 0 0 1 1h4v-4H5a1 1 0 0 0-1 1m14-4V9a1 1 0 0 0-1-1h-2v4h2a1 1 0 0 0 1-1m-5-9h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 .29.71l.71.7v13a1.5 1.5 0 1 0 2 0v-13l.71-.7A1 1 0 0 0 14 5V3a1 1 0 0 0-1-1m6 12h-4v4h4a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1M4 9v2a1 1 0 0 0 1 1h4V8H5a1 1 0 0 0-1 1"
          />
    </Svg>
  );
}
