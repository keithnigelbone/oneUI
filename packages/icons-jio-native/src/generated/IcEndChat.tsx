import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcEndChat(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16.88 7.12c.39.39 1.02.39 1.41 0l.71-.71.71.71a.996.996 0 1 0 1.41-1.41L20.41 5l.71-.71a.996.996 0 1 0-1.41-1.41l-.71.71-.71-.71a.996.996 0 1 0-1.41 1.41l.71.71-.71.71a.996.996 0 0 0 0 1.41m4.87 2.05c-.79.52-1.73.83-2.75.83a5.002 5.002 0 0 1-4.9-6H9c-3.87 0-7 3.13-7 7 0 3.53 2.61 6.43 6 6.92V20c0 1.24 1.41 1.94 2.4 1.2l4.27-3.2H15c3.87 0 7-3.13 7-7 0-.63-.09-1.25-.25-1.83"
          />
    </Svg>
  );
}
