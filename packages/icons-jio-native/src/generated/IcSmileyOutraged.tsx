import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSmileyOutraged(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m3.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m-7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m-2 8.6a6 6 0 0 1 11 0 1 1 0 0 1-.91 1.4H7.42a1 1 0 0 1-.91-1.4z"
          />
    </Svg>
  );
}
