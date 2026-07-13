import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBluetooth(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 16.59v-.15a1.4 1.4 0 0 0-.07-.29v-.12a1.1 1.1 0 0 0-.28-.33L13.67 12l4.93-3.7a1.1 1.1 0 0 0 .28-.3v-.12a1.4 1.4 0 0 0 .12-.32v-.15a1.3 1.3 0 0 0-.06-.27 1 1 0 0 0-.1-.14.4.4 0 0 0 0-.09 1 1 0 0 0-.13-.11s0-.07-.07-.09l-6-4.5A1 1 0 0 0 11 3v7L6.6 6.7a1 1 0 1 0-1.2 1.6l4.93 3.7-4.93 3.7a1 1 0 1 0 1.2 1.6L11 14v7a1 1 0 0 0 .55.89 1 1 0 0 0 1-.09l6-4.5s.06-.08.09-.11.08-.05.11-.09a.4.4 0 0 0 0-.09q.045-.072.08-.15a1.3 1.3 0 0 0 .17-.27M13 5l3.33 2.5L13 10zm0 14v-5l3.33 2.5z"
          />
    </Svg>
  );
}
