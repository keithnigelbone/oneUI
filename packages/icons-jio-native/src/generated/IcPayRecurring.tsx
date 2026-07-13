import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPayRecurring(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15.5 9a1 1 0 0 0-1-1h-5a1 1 0 0 0 0 2h2a1 1 0 1 1 0 2h-1a1 1 0 0 0-.45 1.89l4 2a.93.93 0 0 0 .45.11 1 1 0 0 0 .89-.55 1 1 0 0 0-.39-1.34l-1.56-.78a3 3 0 0 0 .88-3.33h.18a1 1 0 0 0 1-1M12 2A10 10 0 0 0 2 12q-.003.562.07 1.12a1.007 1.007 0 0 0 2-.24A9 9 0 0 1 4 12a8 8 0 1 1 2.73 6h.77a1 1 0 0 0 0-2h-3a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0v-.43A10 10 0 1 0 12 2"
          />
    </Svg>
  );
}
