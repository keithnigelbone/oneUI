import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMessageRead(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 15a1 1 0 0 0 .71-.29l7-7a1.004 1.004 0 0 0-1.42-1.42l-7 7A1 1 0 0 0 12 15m-8.29-2.71a1.004 1.004 0 0 0-1.42 1.42l5 5a1 1 0 0 0 1.64-.325 1 1 0 0 0-.22-1.095zm18-4a1 1 0 0 0-1.42 0L12 16.59l-4.29-4.3a1.004 1.004 0 0 0-1.42 1.42l5 5a1 1 0 0 0 1.42 0l9-9a1 1 0 0 0 0-1.42"
          />
    </Svg>
  );
}
