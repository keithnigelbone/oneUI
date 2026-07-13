import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcNonVeg(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 3H6C4.35 3 3 4.35 3 6v12c0 1.65 1.35 3 3 3h12c1.65 0 3-1.35 3-3V6c0-1.65-1.35-3-3-3m1 15c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1zm-6.14-9.5c-.36-.62-1.37-.62-1.73 0l-3.5 6c-.18.31-.18.69 0 1s.51.5.87.5h7c.36 0 .69-.19.87-.5s.18-.69 0-1l-3.5-6z"
          />
    </Svg>
  );
}
