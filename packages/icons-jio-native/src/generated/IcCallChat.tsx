import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCallChat(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16.62 15.86a2 2 0 0 0-2.83 0l-.7.71a1 1 0 0 1-1.42 0S8.14 13 7.43 12.33a1 1 0 0 1 0-1.42l.71-.7a2 2 0 0 0 0-2.83l-.71-.71a2 2 0 0 0-2.83 0l-1 1a2 2 0 0 0-.56 1.13c-.16 1.4-.04 4.74 3.68 8.48s7.08 3.84 8.49 3.72a2 2 0 0 0 1.13-.56l1-1a2 2 0 0 0 0-2.83zM17.5 3h-3a3.49 3.49 0 0 0-1.19 6.78L13 11.09a.74.74 0 0 0 .31.78.72.72 0 0 0 .42.13.7.7 0 0 0 .42-.13L16.9 10h.6a3.5 3.5 0 1 0 0-7"
          />
    </Svg>
  );
}
