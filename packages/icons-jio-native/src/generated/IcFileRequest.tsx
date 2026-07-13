import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFileRequest(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15.5 7h4c0-.53-.21-1.04-.59-1.41l-3-3c-.37-.38-.88-.59-1.41-.59v4c0 .27.11.52.29.71s.44.29.71.29"
          />
          <Path
            fill={fill}
            d="M13.38 8.12c-.56-.56-.88-1.33-.88-2.12V2H7c-.66 0-1.3.26-1.77.73S4.5 3.83 4.5 4.5v15c0 .66.26 1.3.73 1.77S6.33 22 7 22h10c.66 0 1.3-.26 1.77-.73s.73-1.1.73-1.77V9h-4c-.8 0-1.56-.32-2.12-.88m2.33 8.58-3 3c-.09.09-.2.17-.33.22-.12.05-.25.08-.38.08s-.26-.03-.38-.08-.23-.12-.33-.22l-3-3a.996.996 0 1 1 1.41-1.41l1.29 1.29v-5.59c0-.55.45-1 1-1s1 .45 1 1v5.59l1.29-1.29a.996.996 0 1 1 1.41 1.41z"
          />
    </Svg>
  );
}
