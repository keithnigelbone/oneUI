import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAirfiber(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M13.56 9H6.45c-.8 0-1.44.58-1.44 1.3v9.4c0 .72.65 1.3 1.44 1.3h7.11c.8 0 1.44-.58 1.44-1.3v-9.4c0-.72-.65-1.3-1.44-1.3M10 16.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5M14.9 1.98c-.55 0-1 .45-1 1s.45 1 1 1c2.79 0 5.06 2.27 5.06 5.06 0 .55.45 1 1 1s1-.45 1-1c0-3.9-3.17-7.06-7.06-7.06"
          />
          <Path
            fill={fill}
            d="M14.5 5.04c-.55 0-1 .45-1 1s.45 1 1 1a2.5 2.5 0 0 1 2.5 2.5c0 .55.45 1 1 1s1-.45 1-1c0-2.48-2.02-4.5-4.5-4.5"
          />
    </Svg>
  );
}
