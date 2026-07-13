import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAlarm(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m3.88 6.71 2.83-2.83a1.004 1.004 0 0 0-1.42-1.42L2.46 5.29a1.004 1.004 0 1 0 1.42 1.42m17.66-1.42-2.83-2.83a1.004 1.004 0 1 0-1.42 1.42l2.83 2.83a1.004 1.004 0 0 0 1.42-1.42M12 4a9 9 0 0 0-7.46 14l-1.25 1.29a1.004 1.004 0 1 0 1.42 1.42l1.14-1.15a9 9 0 0 0 12.3 0l1.14 1.15a1.004 1.004 0 1 0 1.42-1.42L19.46 18A9 9 0 0 0 12 4m2.12 11.12a1 1 0 0 1-1.41 0l-1.42-1.41a1.2 1.2 0 0 1-.21-.33A1 1 0 0 1 11 13V8a1 1 0 0 1 2 0v4.59l1.12 1.12a1 1 0 0 1 0 1.41"
          />
    </Svg>
  );
}
