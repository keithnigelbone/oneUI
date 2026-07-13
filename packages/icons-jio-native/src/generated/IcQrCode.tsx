import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcQrCode(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
                d='M7 15H5c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2zm5-6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1zm7-6h-2c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 9h2c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2zm14 2h-2c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2zm1 8h-7v-6c0-1.1-.9-2-2-2H4c-.55 0-1 .45-1 1s.45 1 1 1h7v6c0 1.1.9 2 2 2h7c.55 0 1-.45 1-1s-.45-1-1-1z'
                fill='currentColor'
              />
    </Svg>
  );
}
