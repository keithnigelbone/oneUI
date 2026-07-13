import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPushup(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18.46 8.5c-.86 0-1.56.7-1.56 1.56s.7 1.56 1.56 1.56 1.56-.7 1.56-1.56-.7-1.56-1.56-1.56M16.37 12.05a2.253 2.253 0 0 0-2.78-1.11l-9.95 3.62c-.52.19-.79.76-.6 1.28a1 1 0 0 0 1.28.6l9.95-3.62c.12-.04.25.01.31.12l1.5 3c.25.49.85.69 1.34.45.49-.25.69-.85.45-1.34z"
          />
    </Svg>
  );
}
