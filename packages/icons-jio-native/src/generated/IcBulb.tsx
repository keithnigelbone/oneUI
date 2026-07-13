import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBulb(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7.4 7.9a1 1 0 0 0 0-1.41l-.7-.71A1.004 1.004 0 1 0 5.28 7.2l.72.7a1 1 0 0 0 1.41 0zm-2.9 3.6h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2M12 6a1 1 0 0 0 1-1V4a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1m2 13h-4a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2m6.5-7.5h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2m-1.78-5.72a1 1 0 0 0-1.42 0l-.7.71a1 1 0 0 0 0 1.41 1 1 0 0 0 1.4 0l.71-.7a1 1 0 0 0 .01-1.42M12 7a5.87 5.87 0 0 0-3.1 10.85 1 1 0 0 0 .53.15h5.14a1 1 0 0 0 .53-.15A5.87 5.87 0 0 0 12 7"
          />
    </Svg>
  );
}
