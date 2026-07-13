import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPestProblem(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 13a4 4 0 0 1 4-4h.06a14 14 0 0 1 .84-4.57 1 1 0 0 0 0-1A1 1 0 0 0 20 3h-6a2 2 0 0 1-3.9.6C5.64 5.06 3 9.15 3 15c0 2.81.73 4.33 1.63 5.13a.25.25 0 0 0 .311-.035A.25.25 0 0 0 5 20c.33-6 3.54-10.29 9.57-12.87a1 1 0 1 1 .78 1.84C9.83 11.3 7.09 15.17 7 20.73a.27.27 0 0 0 .27.27 19.2 19.2 0 0 0 4.37-.54A2 2 0 1 1 15 19v.13a10.4 10.4 0 0 0 3.08-2.64A4 4 0 0 1 16 13"
          />
    </Svg>
  );
}
