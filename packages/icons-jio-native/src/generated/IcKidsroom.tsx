import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcKidsroom(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 4a1 1 0 0 0-1 1v1H5V5a1 1 0 0 0-2 0v14.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V18h14v1.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V5a1 1 0 0 0-1-1M7 14H5V8h2zm4 0H9V8h2zm4 0h-2V8h2zm4 0h-2V8h2z"
          />
    </Svg>
  );
}
