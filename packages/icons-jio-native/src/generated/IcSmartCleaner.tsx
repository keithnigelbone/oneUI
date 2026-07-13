import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSmartCleaner(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 4a7.92 7.92 0 0 1 4.9 1.69l1.42-1.43a10 10 0 0 0-12.64 0L7.1 5.69A7.92 7.92 0 0 1 12 4m0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12m1 5a1 1 0 0 1-2 0V9a1 1 0 1 1 2 0zm-9 1a7.92 7.92 0 0 1 1.69-4.9L4.26 5.68a10 10 0 0 0 0 12.64l1.43-1.42A7.92 7.92 0 0 1 4 12m15.74-6.32L18.31 7.1a7.95 7.95 0 0 1 0 9.8l1.43 1.42a10 10 0 0 0 0-12.64M12 20a7.92 7.92 0 0 1-4.9-1.69l-1.42 1.43a10 10 0 0 0 12.64 0l-1.42-1.43A7.92 7.92 0 0 1 12 20"
          />
    </Svg>
  );
}
