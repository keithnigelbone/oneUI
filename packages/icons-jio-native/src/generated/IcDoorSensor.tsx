import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDoorSensor(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15.23 2.42a2 2 0 0 0-1.72-.36l-8 2A2 2 0 0 0 4 6v12a2 2 0 0 0 1.51 1.94l8 2q.241.06.49.06a2 2 0 0 0 1.798-1.12c.133-.275.202-.575.202-.88V4a2 2 0 0 0-.77-1.58M13 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2m6-9a1 1 0 0 0-1 1v14a1 1 0 0 0 2 0V5a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
