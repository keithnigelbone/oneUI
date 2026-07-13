import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTornado(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 4c.55 0 1-.45 1-1s-.45-1-1-1H3c-.55 0-1 .45-1 1s.45 1 1 1zm-1 2c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1m2 3c0-.55-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h13c.55 0 1-.45 1-1m0 2H10c-.55 0-1 .45-1 1s.45 1 1 1h11c.55 0 1-.45 1-1s-.45-1-1-1m-2 3h-8c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1s-.45-1-1-1m-5 3h-4c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1m-3 3h-1c-.55 0-1 .45-1 1s.45 1 1 1h1c.55 0 1-.45 1-1s-.45-1-1-1"
          />
    </Svg>
  );
}
