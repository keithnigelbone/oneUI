import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPhoneSecured(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M11 7.5V2H9C7.34 2 6 3.34 6 5v14c0 1.66 1.34 3 3 3h6c1.66 0 3-1.34 3-3v-5.03c-.17.01-.33.03-.5.03A6.5 6.5 0 0 1 11 7.5M12 20c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1m9.73-16.66c-.17-.18-.4-.3-.65-.33-1.1-.12-2.18-.42-3.17-.91a1 1 0 0 0-.41-.1c-.14 0-.28.03-.41.1-.99.49-2.05.8-3.15.91-.25.02-.49.14-.66.32s-.27.43-.28.68v2.5C13 9.88 16.38 12 17.5 12S22 9.88 22 6.51v-2.5c0-.25-.1-.49-.27-.67"
          />
    </Svg>
  );
}
