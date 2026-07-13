import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcGlobe(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m-1 17.93A8 8 0 0 1 4 12a8 8 0 0 1 .21-1.79L9 15v1a1 1 0 0 0 1 1h1zm7.72-3.61A1 1 0 0 0 18 16h-3v-3a1 1 0 0 0-1-1H9v-2h2a1 1 0 0 0 1-1V7h3V4.59A8 8 0 0 1 20 12a7.9 7.9 0 0 1-1.28 4.32"
          />
    </Svg>
  );
}
