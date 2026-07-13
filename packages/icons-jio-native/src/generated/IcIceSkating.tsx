import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcIceSkating(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M20 17a1 1 0 0 0-1 1v1h-2v-5a1 1 0 0 0-.45-.83l-2.78-1.86 2-2.71a1 1 0 0 0 .09-1A1 1 0 0 0 15 7H8a1 1 0 0 0 0 2h5l-4.5 6H5v-2a1 1 0 1 0-2 0v6a2 2 0 0 0 2 2h1a1 1 0 0 0 0-2H5v-2h4a1 1 0 0 0 .8-.4l2.77-3.69L15 14.54V19h-2a1 1 0 0 0 0 2h6a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
