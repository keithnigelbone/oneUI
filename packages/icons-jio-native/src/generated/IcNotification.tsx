import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcNotification(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21 16h-1V10c0-2.121-.796-4.162-2.214-5.68A7.996 7.996 0 0 0 12 2a7.996 7.996 0 0 0-5.786 2.32A8.01 8.01 0 0 0 4 10v6H3a1 1 0 0 0-1 1 1 1 0 0 0 1 1h18a1 1 0 0 0 1-1 1 1 0 0 0-1-1ZM12 22a2.99 2.99 0 0 0 3-3H9a2.99 2.99 0 0 0 3 3Z"
          />
    </Svg>
  );
}
