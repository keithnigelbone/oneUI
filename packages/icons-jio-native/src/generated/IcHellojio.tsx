import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHellojio(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16.5 12c2.49 0 4.5-2.01 4.5-4.5S18.99 3 16.5 3 12 5.01 12 7.5s2.01 4.5 4.5 4.5M12 7.5C12 5.01 9.99 3 7.5 3S3 5.01 3 7.5 5.01 12 7.5 12 12 9.99 12 7.5m4.5 4.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5m-9 0C5.01 12 3 14.01 3 16.5S5.01 21 7.5 21s4.5-2.01 4.5-4.5S9.99 12 7.5 12"
          />
    </Svg>
  );
}
