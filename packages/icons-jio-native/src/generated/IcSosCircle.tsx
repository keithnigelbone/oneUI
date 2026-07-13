import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSosCircle(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M7.75 14h-1.5a.5.5 0 0 1 0-1h1.5a.25.25 0 1 0 0-.5h-1a1.25 1.25 0 0 1 0-2.5h1.5a.5.5 0 0 1 0 1h-1.5a.25.25 0 1 0 0 .5h1a1.25 1.25 0 0 1 0 2.5M12 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4m5.25 0h-1.5a.5.5 0 0 1 0-1h1.5a.25.25 0 1 0 0-.5h-1a1.25 1.25 0 0 1 0-2.5h1.5a.5.5 0 0 1 0 1h-1.5a.25.25 0 1 0 0 .5h1a1.25 1.25 0 0 1 0 2.5M12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
