import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCart(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 20 20" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7.083 15.833a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm7.5 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm3.433-10.141a1.67 1.67 0 0 0-1.35-.692H5.483l-.341-1.267a1.67 1.67 0 0 0-1.617-.733H2.5a.833.833 0 1 0 0 1.667h1.025l2.358 8.733a1.67 1.67 0 0 0 1.617 1.267h7.225a1.67 1.67 0 0 0 1.575-1.142l1.95-5.833a1.67 1.67 0 0 0-.234-1.5Z"
          />
    </Svg>
  );
}
