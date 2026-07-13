import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSubscriptions(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18.66 4c.284.628.427 1.31.42 2v12a4.75 4.75 0 0 1-.42 2A2.71 2.71 0 0 0 21 17.28V6.72A2.71 2.71 0 0 0 18.66 4M15 2H6a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3M7.29 7.29a1 1 0 0 1 1.42 0l.79.8 2.79-2.8a1.003 1.003 0 1 1 1.42 1.42l-3.5 3.5a1 1 0 0 1-1.42 0l-1.5-1.5a1 1 0 0 1 0-1.42M14 19H7a1 1 0 0 1 0-2h7a1 1 0 0 1 0 2m0-4H7a1 1 0 0 1 0-2h7a1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
