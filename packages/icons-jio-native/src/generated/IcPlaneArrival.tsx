import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPlaneArrival(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m19.25 15.16-2.77-1.38-2.07-7.06a1 1 0 0 0-.52-.61l-2-1a1 1 0 0 0-1.44.95l.27 4.85-2.51-1.26-.16-2.89a1 1 0 0 0-.56-.84l-2-1a1 1 0 0 0-.91 0 1 1 0 0 0-.52.74l-.48 3.39a3 3 0 0 0 .57 2.23l.1.13c.58.78 1.338 1.41 2.21 1.84l11.11 5.54a2 2 0 0 0 2.76-1.09 2.07 2.07 0 0 0-1.08-2.54"
          />
    </Svg>
  );
}
