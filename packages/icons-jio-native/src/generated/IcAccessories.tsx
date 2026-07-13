import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAccessories(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21 11h-.14a4.1 4.1 0 0 0-1.13-1.91 4 4 0 0 0-5.93.52 2.89 2.89 0 0 0-3.6 0 4 4 0 0 0-5.93-.52A4.1 4.1 0 0 0 3.14 11H3a1 1 0 0 0-.71.3 1 1 0 0 0 0 1.42A1 1 0 0 0 3 13h.14a4 4 0 0 0 4.37 3A4 4 0 0 0 11 12a1 1 0 1 1 2 0 4 4 0 0 0 3.49 4 4 4 0 0 0 4.37-3H21a1 1 0 0 0 .71-.3 1 1 0 0 0 0-1.42A1 1 0 0 0 21 11"
          />
    </Svg>
  );
}
