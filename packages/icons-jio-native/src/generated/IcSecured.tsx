import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSecured(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.46 4.68a2 2 0 0 0-1.3-.68 18.8 18.8 0 0 1-6.34-1.83 1.86 1.86 0 0 0-1.64 0A18.5 18.5 0 0 1 4.88 4 2.06 2.06 0 0 0 3 6v5c0 6.74 6.75 11 9 11s9-4.25 9-11V6a2 2 0 0 0-.54-1.32m-6.54 10.57a1 1 0 0 1-1 1.25h-1.69a1 1 0 0 1-1-1.21l.68-3.2a.5.5 0 0 0-.12-.42l-.09-.08A2.25 2.25 0 0 1 9.88 9a1 1 0 0 1 0-.14 2.25 2.25 0 0 1 1-1h.14l.14-.06a2.3 2.3 0 0 1 .43-.12h.75a2.28 2.28 0 0 1 1.87 2.21 2.25 2.25 0 0 1-.95 1.83.4.4 0 0 0-.09.09.49.49 0 0 0-.12.45z"
          />
    </Svg>
  );
}
