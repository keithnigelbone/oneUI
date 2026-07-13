import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTemperatureDown(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.71 16.29a1 1 0 0 0-1.42 0l-.29.3V5a1 1 0 1 0-2 0v11.59l-.29-.3a1.004 1.004 0 1 0-1.42 1.42l2 2a1 1 0 0 0 1.42 0l2-2a1 1 0 0 0 0-1.42M12 7a4 4 0 1 0-8 0v6a4.94 4.94 0 0 0-1 3 5 5 0 1 0 10 0 4.94 4.94 0 0 0-1-3zM8 18a2 2 0 0 1-2-2 2 2 0 0 1 1-1.72V8a1 1 0 0 1 2 0v6.28A2 2 0 0 1 10 16a2 2 0 0 1-2 2"
          />
    </Svg>
  );
}
