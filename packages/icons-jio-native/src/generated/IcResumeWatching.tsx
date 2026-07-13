import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcResumeWatching(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-8 5a1 1 0 0 1 .53-.88 1 1 0 0 1 1 0l3 2a1 1 0 0 1 0 1.66l-3 2A1 1 0 0 1 10 12zm7 10H7a1 1 0 0 1 0-2h10a1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
