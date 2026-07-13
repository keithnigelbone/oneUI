import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFlashOff(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18.05 12.71a2 2 0 0 0-1.51-3.24h-2.67l2-5.48a1.48 1.48 0 0 0-2.54-1.43l-2.88 3.6 7.14 7.14zM20.49 19 5 3.51A1.054 1.054 0 0 0 3.51 5l4.37 4.32-2.29 2.86a2 2 0 0 0 1.54 3.2h2.8L8.16 20a1.48 1.48 0 0 0 2.52 1.48L15 16.39l4 4.1A1.054 1.054 0 1 0 20.49 19"
          />
    </Svg>
  );
}
