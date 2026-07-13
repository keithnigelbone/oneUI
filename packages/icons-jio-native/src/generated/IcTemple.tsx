import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTemple(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18.74 9.14a4.3 4.3 0 0 0-.11-3.35C17.94 4.4 16.45 3.47 14.2 3a5.2 5.2 0 0 1-1.6-.82l-.09-.05a.2.2 0 0 1-.07 0h-.54a.7.7 0 0 0-.14 0h-.13l-.08.05h-.09A4.55 4.55 0 0 1 9.81 3c-2.24.42-3.74 1.34-4.43 2.72a4.36 4.36 0 0 0-.12 3.4A2 2 0 0 0 4 11v9a2 2 0 0 0 2 2h4v-4.89A2.07 2.07 0 0 1 11.66 15 2 2 0 0 1 14 17v5h4a2 2 0 0 0 2-2v-9a2 2 0 0 0-1.26-1.86"
          />
    </Svg>
  );
}
