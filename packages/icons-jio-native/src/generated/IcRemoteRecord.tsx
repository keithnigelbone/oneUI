import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRemoteRecord(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M13 9.5h-3v2h3a1 1 0 0 0 0-2M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m3.83 13a1 1 0 0 1-.28 1.38.94.94 0 0 1-.55.17 1 1 0 0 1-.83-.45l-1.71-2.6H10v2a1 1 0 1 1-2 0v-7a1 1 0 0 1 1-1h4a3 3 0 0 1 1.57 5.55z"
          />
    </Svg>
  );
}
