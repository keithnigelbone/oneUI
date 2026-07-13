import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHcvTop(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 11v-.76a2 2 0 0 0-.21-.9L17 7.76V7h1a1 1 0 1 0 0-2h-1v-.5a1 1 0 0 0-.17-.5c-.13-.25-1.39-2-4.83-2S7.3 3.75 7.17 4a1 1 0 0 0-.17.5V5H6a1 1 0 0 0 0 2h1v.76l-.79 1.58a2 2 0 0 0-.21.9V11a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2 3 3 0 0 0 3 3h6a3 3 0 0 0 3-3 2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2m-7 7a1 1 0 0 1-2 0v-8a1 1 0 0 1 2 0zm4 0a1 1 0 0 1-2 0v-8a1 1 0 0 1 2 0zm-.33-12H9.33A.33.33 0 0 1 9 5.67 1.67 1.67 0 0 1 10.67 4h2.66A1.67 1.67 0 0 1 15 5.67a.33.33 0 0 1-.33.33"
          />
    </Svg>
  );
}
