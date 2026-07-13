import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTariffChecking(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M14 5a5 5 0 0 1 1-3H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V9.9A5 5 0 0 1 14 5m.5 9a3 3 0 0 1-1.11 2.33l1.56.78A1 1 0 0 1 14.5 19a.93.93 0 0 1-.45-.11l-4-2A1 1 0 0 1 10.5 15h1a1 1 0 0 0 0-2h-2a1 1 0 0 1 0-2h5a1 1 0 0 1 0 2h-.18a3 3 0 0 1 .18 1m5-12a1 1 0 0 0-1 1v2h-1a1 1 0 1 0 0 2h2a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
