import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDislike(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m3.568 6.67-.55 5A3 3 0 0 0 5.998 15h4v3.92a2 2 0 0 0 3.94.56l1-4q.06-.236.06-.48V4h-8.45a3 3 0 0 0-2.98 2.67M18.998 4h-2v11h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2"
          />
    </Svg>
  );
}
