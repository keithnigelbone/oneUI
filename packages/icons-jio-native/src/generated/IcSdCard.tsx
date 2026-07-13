import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSdCard(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 2H9a3 3 0 0 0-3 3v5.59l-1.12 1.12A3 3 0 0 0 4 13.83V19a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3m-7 5a1 1 0 0 1-2 0V5a1 1 0 0 1 2 0zm4 0a1 1 0 0 1-2 0V5a1 1 0 0 1 2 0zm4 0a1 1 0 0 1-2 0V5a1 1 0 0 1 2 0z"
          />
    </Svg>
  );
}
