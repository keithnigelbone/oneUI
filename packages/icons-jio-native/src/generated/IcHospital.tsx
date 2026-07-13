import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHospital(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m20.06 7.68-7-4.38a2 2 0 0 0-2.12 0l-7 4.38A2 2 0 0 0 3 9.37V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9.37a2 2 0 0 0-.94-1.69M15 14h-2v2a1 1 0 0 1-2 0v-2H9a1 1 0 0 1 0-2h2v-2a1 1 0 0 1 2 0v2h2a1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
