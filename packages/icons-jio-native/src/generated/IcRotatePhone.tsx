import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRotatePhone(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 12H8c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2m-1 6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1m-7-8V4c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2v-4c0-2.21 1.79-4 4-4zm4-6h.98c.27 0 .52.1.71.3.19.19.29.44.29.73v1.55l-.27-.28a.996.996 0 1 0-1.41 1.41l2 2c.2.2.45.29.71.29s.51-.1.71-.29l2-2a.996.996 0 1 0-1.41-1.41l-.3.3V5.03c0-.81-.31-1.57-.88-2.14S17.81 2 17 2h-.98c-.55 0-1 .45-1 1s.45 1 1 1z"
          />
    </Svg>
  );
}
