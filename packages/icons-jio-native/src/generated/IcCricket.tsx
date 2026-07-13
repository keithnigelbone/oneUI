import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCricket(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15.994 17.008a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-13.41 2.41 2 2a2 2 0 0 0 2.82 0l10-10a2 2 0 0 0 .59-1.41v-2a2 2 0 0 0-.07-.51l3.78-3.78a1 1 0 0 0-.325-1.638 1 1 0 0 0-1.095.218l-3.78 3.78a2 2 0 0 0-.51-.07h-2a2 2 0 0 0-1.41.59l-10 10a2 2 0 0 0 0 2.82"
          />
    </Svg>
  );
}
