import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTrafficCone(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M14 3.7a1 1 0 0 0-1-.7h-2a1 1 0 0 0-.95.7L8.7 8h6.6zM20 19h-1.26l-.94-3H6.2l-.94 3H4a1 1 0 1 0 0 2h16a1 1 0 0 0 0-2m-4.08-9H8.08l-1.25 4h10.34z"
          />
    </Svg>
  );
}
