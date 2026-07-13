import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAnimation(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.53 4.47a4.51 4.51 0 0 0-6.36-.3A4 4 0 0 0 13 7.08a6.5 6.5 0 0 0-2 0 4 4 0 0 0-1.17-2.91 4.51 4.51 0 0 0-6.36.3 4.51 4.51 0 0 0-.3 6.36 4 4 0 0 0 2.14 1.09A7.2 7.2 0 0 0 5 14a7 7 0 1 0 14 0c0-.705-.105-1.406-.31-2.08a4 4 0 0 0 2.14-1.09 4.51 4.51 0 0 0-.3-6.36"
          />
    </Svg>
  );
}
