import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAntiCorrosion(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 16a5 5 0 0 0 5-5 6.3 6.3 0 0 0-.91-3.24l-3.24-5.28a1 1 0 0 0-1.7 0L7.91 7.76A6.3 6.3 0 0 0 7 11a5 5 0 0 0 5 5m7 2H5a1 1 0 1 0 0 2h.59l-.3.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0L8.41 20h2.18l-.3.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l1.7-1.71h2.18l-.3.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l1.7-1.71H19a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
