import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWarehouse(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m20.06 7.68-7-4.38a2 2 0 0 0-2.12 0l-7 4.38A2 2 0 0 0 3 9.37V19a2 2 0 0 0 2 2v-8.5A1.5 1.5 0 0 1 6.5 11h11a1.5 1.5 0 0 1 1.5 1.5V21a2 2 0 0 0 2-2V9.37a2 2 0 0 0-.94-1.69M14 9h-4a1 1 0 0 1 0-2h4a1 1 0 1 1 0 2m-3.5 9h-3a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5m0-5h-3a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5m6 5h-3a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5m0-5h-3a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5"
          />
    </Svg>
  );
}
