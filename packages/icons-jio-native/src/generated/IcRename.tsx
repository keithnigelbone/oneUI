import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRename(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10.43 4.63a1 1 0 0 0-1.86 0l-5.5 14a1 1 0 0 0 0 .77c.11.24.307.429.55.53a1 1 0 0 0 .77 0c.24-.11.429-.307.53-.55L6.65 15h5.7l1.72 4.37a1 1 0 0 0 .21.32 1 1 0 0 0 .32.23 1.07 1.07 0 0 0 .79.01 1 1 0 0 0 .32-.21 1 1 0 0 0 .23-.32A1 1 0 0 0 16 19a1.1 1.1 0 0 0-.07-.39zm-3 8.37L9.5 7.73 11.57 13zM19 3a1 1 0 0 0-1 1v16a1 1 0 0 0 2 0V4a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
