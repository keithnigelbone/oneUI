import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcConversation(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M11 14c-.26 0-.51-.1-.71-.29a.996.996 0 0 1 0-1.41l8-8.01A.996.996 0 1 1 19.7 5.7l-7.99 8.01c-.2.2-.45.29-.71.29"
          />
          <Path
            fill={fill}
            d="M18 20H6c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h6c.55 0 1 .45 1 1s-.45 1-1 1H6v12h12v-6c0-.55.45-1 1-1s1 .45 1 1v6c0 1.1-.9 2-2 2"
          />
    </Svg>
  );
}
