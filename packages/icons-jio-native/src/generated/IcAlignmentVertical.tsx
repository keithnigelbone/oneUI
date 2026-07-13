import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAlignmentVertical(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15 17h-2V7h2a1.002 1.002 0 0 0 .7-1.71l-3-3a.996.996 0 0 0-1.41 0l-3 3c-.29.29-.37.72-.22 1.09s.52.62.92.62h2v10h-2a1.002 1.002 0 0 0-.7 1.71l3 3c.2.2.45.29.71.29s.51-.1.71-.29l3-3c.29-.29.37-.72.22-1.09s-.52-.62-.92-.62z"
          />
    </Svg>
  );
}
