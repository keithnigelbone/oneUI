import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFlashAuto(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16.54 9.47h-2.67l2-5.48a1.48 1.48 0 0 0-2.54-1.43l-7.7 9.62a2 2 0 0 0 1.54 3.2h2.8L8.16 20a1.48 1.48 0 0 0 2.52 1.48l7.37-8.75a2 2 0 0 0-1.51-3.26M6 7.68a.51.51 0 0 0 .5.32q.09.015.18 0A.52.52 0 0 0 7 7.32l-1.5-4a.52.52 0 0 0-.94 0L3 7.32a.52.52 0 0 0 .32.68.51.51 0 0 0 .68-.32L4.22 7h1.56zM4.6 6 5 4.92 5.4 6z"
          />
    </Svg>
  );
}
