import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMultipleUser(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path fill={fill} d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
          <Path
            fill={fill}
            d="M6 19c-.26 0-.51-.1-.71-.29a.996.996 0 0 1 0-1.41l11.5-11.5a.996.996 0 1 1 1.41 1.41L6.7 18.71c-.2.2-.45.29-.71.29z"
          />
          <Path
            fill={fill}
            d="M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6M18 15c-.59 0-1.14.18-1.61.48L8.52 7.61C8.82 7.14 9 6.59 9 6c0-1.66-1.34-3-3-3S3 4.34 3 6s1.34 3 3 3c.33 0 .63-.06.93-.16l8.24 8.24c-.1.29-.16.6-.16.93 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z"
          />
    </Svg>
  );
}
