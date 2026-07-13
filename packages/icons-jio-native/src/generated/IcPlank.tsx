import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPlank(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7.18 16.13H4.44c-.55 0-1-.45-1-1s.45-1 1-1h2.74v-3.78c0-.55.45-1 1-1s1 .45 1 1v3.78c0 1.1-.9 2-2 2"
          />
          <Path
            fill={fill}
            d="M20.69 14.15 14 12.88c-.1-.03-.19-.06-.24-.09L8.73 9.52a1 1 0 0 0-1.38.29 1 1 0 0 0 .29 1.38l5.07 3.29c.25.14.5.25.85.34l6.76 1.29a.995.995 0 0 0 1.17-.79c.1-.54-.25-1.07-.79-1.17zM5.58 8.98c-.27-.11-.58-.14-.87-.09-.29.06-.56.2-.77.41s-.35.48-.41.77-.03.59.09.87c.11.27.31.51.55.67a1.499 1.499 0 0 0 2.33-1.25c0-.3-.09-.59-.25-.83-.16-.25-.4-.44-.67-.55"
          />
    </Svg>
  );
}
