import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHourglass(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 4a1 1 0 1 0 0-2H5a1 1 0 0 0 0 2c.38 4.49 3.35 8 7 8s6.57-3.51 7-8M8.51 8a8.2 8.2 0 0 1-1.45-4h9.88a8.2 8.2 0 0 1-1.45 4zM19 20c-.38-4.49-3.35-8-6.95-8s-6.57 3.51-6.95 8H5a1 1 0 0 0 0 2h14a1 1 0 0 0 0-2M8.51 16A4.37 4.37 0 0 1 12 14a4.37 4.37 0 0 1 3.49 2z"
          />
    </Svg>
  );
}
