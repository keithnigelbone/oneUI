import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcLastpage(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M6.71 4.29A.996.996 0 1 0 5.3 5.7l6.29 6.29-6.29 6.29a.996.996 0 0 0 .71 1.7c.26 0 .51-.1.71-.29l7-7a.996.996 0 0 0 0-1.41zM17 4c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1s1-.45 1-1V5c0-.55-.45-1-1-1"
          />
    </Svg>
  );
}
