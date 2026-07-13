import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcItalic(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 3h-9c-.55 0-1 .45-1 1s.45 1 1 1h3.38l-7 14H4c-.55 0-1 .45-1 1s.45 1 1 1h9c.55 0 1-.45 1-1s-.45-1-1-1H9.62l7-14H20c.55 0 1-.45 1-1s-.45-1-1-1"
          />
    </Svg>
  );
}
