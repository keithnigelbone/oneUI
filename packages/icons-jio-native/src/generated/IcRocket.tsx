import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRocket(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M4.14 16.14a1 1 0 0 0-1.65.39l-.27.81a.5.5 0 0 0 .47.66H4l-1.33 2.66a.5.5 0 0 0 .67.67L6 20v1.31a.5.5 0 0 0 .66.47l.8-.27a1 1 0 0 0 .4-1.65zm16.17-14A20.2 20.2 0 0 0 10.88 5H7.24a2 2 0 0 0-1.79 1.11l-2.73 5.44a1 1 0 0 0 .9 1.45h1.57c-.06.33-.12.65-.15 1a2.05 2.05 0 0 0 .58 1.63l2.76 2.76A2.05 2.05 0 0 0 10 19c.34 0 .66-.09 1-.14v1.56a1 1 0 0 0 1.45.9l5.44-2.73A2 2 0 0 0 19 16.76v-3.6a20.1 20.1 0 0 0 2.92-9.47 1.52 1.52 0 0 0-1.61-1.6zM12 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4"
          />
    </Svg>
  );
}
