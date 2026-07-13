import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDocumentary(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21 20h-3a10 10 0 1 0-6 2h9a1 1 0 0 0 0-2M6 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4m6 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4m-1-8a1 1 0 1 1 2 0 1 1 0 0 1-2 0m1-4a2 2 0 1 1 0-4 2 2 0 0 1 0 4m4 4a2 2 0 1 1 4 0 2 2 0 0 1-4 0"
          />
    </Svg>
  );
}
