import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSendMessage(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
                d='M19.79 10.16l-14-6A2 2 0 005 4a2 2 0 00-1.965 2.398 2 2 0 00.355.792L6.76 12l-3.35 4.79a2 2 0 002.38 3.05l14-6a2 2 0 000-3.68z'
                fill='currentColor'
              />
    </Svg>
  );
}
