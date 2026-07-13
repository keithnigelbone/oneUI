import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcComedy(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 3.41A14.6 14.6 0 0 0 12 2a17 17 0 0 0-6.82 1.14A2 2 0 0 0 4 5v9a8 8 0 1 0 16 0V5.15a2 2 0 0 0-1-1.74M6.2 8.4a2.87 2.87 0 0 1 4.6 0 1 1 0 0 1-1.6 1.2.91.91 0 0 0-1.4 0 1 1 0 1 1-1.6-1.2M12 19a5 5 0 0 1-5-5 1 1 0 0 1 1-1h8a1 1 0 0 1 1 1 5 5 0 0 1-5 5m5.6-9.2a1 1 0 0 1-1.4-.2.91.91 0 0 0-1.4 0 1 1 0 0 1-1.6-1.2 2.88 2.88 0 0 1 4.6 0 1 1 0 0 1-.2 1.4"
          />
    </Svg>
  );
}
