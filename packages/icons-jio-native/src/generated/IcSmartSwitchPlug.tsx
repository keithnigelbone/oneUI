import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSmartSwitchPlug(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 6h-3v12h3a6 6 0 1 0 0-12m2 7a1 1 0 0 1-2 0v-2a1 1 0 0 1 2 0zM2 12a6 6 0 0 0 6 6h3V6H8a6 6 0 0 0-6 6m6.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"
          />
    </Svg>
  );
}
