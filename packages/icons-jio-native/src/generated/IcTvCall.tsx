import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTvCall(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15 19H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m6.41-13.41A2 2 0 0 0 20 5H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-.59-1.41M17.5 13a.77.77 0 0 1-.37.65.77.77 0 0 1-.74.01L15 12.9v.1a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 7 13v-3a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 15 10v.1l1.39-.76a.75.75 0 0 1 .74 0 .77.77 0 0 1 .37.65z"
          />
    </Svg>
  );
}
