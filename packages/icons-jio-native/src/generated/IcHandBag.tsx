import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHandBag(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19.55 9.59a2 2 0 0 0-2-1.83h-1.5v-.71a4.05 4.05 0 0 0-8.1 0v.71H6.44a2 2 0 0 0-2 1.83l-.69 8.16a3 3 0 0 0 3 3.25h10.5a3 3 0 0 0 3-3.25zm-5.5-1.83H10v-.71a2.05 2.05 0 1 1 4.1 0z"
          />
    </Svg>
  );
}
