import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFileShare(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15 7h4c0-.53-.21-1.04-.59-1.41l-3-3C15.04 2.21 14.53 2 14 2v4c0 .27.11.52.29.71s.44.29.71.29"
          />
          <Path
            fill={fill}
            d="M12.88 8.12C12.32 7.56 12 6.79 12 6V2H6.5c-.66 0-1.3.26-1.77.73S4 3.83 4 4.5v15c0 .66.26 1.3.73 1.77s1.1.73 1.77.73h10c.66 0 1.3-.26 1.77-.73s.73-1.1.73-1.77V9h-4c-.8 0-1.56-.32-2.12-.88M15 17.99c0 .55-.45 1-1 1s-1-.45-1-1v-1.58L9.71 19.7c-.2.2-.45.29-.71.29s-.51-.1-.71-.29a.996.996 0 0 1 0-1.41L11.58 15H10c-.55 0-1-.45-1-1s.45-1 1-1h4c.13 0 .26.03.38.08.25.1.44.3.54.54.05.12.08.25.08.38z"
          />
    </Svg>
  );
}
