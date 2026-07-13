import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHomeCare(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.69 15.06a1 1 0 0 0-1.41 0l-2.17 2.28a2 2 0 0 1-1.45.62H12a1 1 0 1 1 0-2h1.66a1 1 0 1 0 0-2H8a2 2 0 0 0-2 2H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h11.66a4 4 0 0 0 2.89-1.24l2.17-2.28a1 1 0 0 0-.03-1.38M14 9v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V9a1 1 0 0 0 .92-.62 1 1 0 0 0-.21-1.09l-3-3a1 1 0 0 0-1.42 0l-3 3a1 1 0 0 0-.21 1.09A1 1 0 0 0 14 9"
          />
    </Svg>
  );
}
