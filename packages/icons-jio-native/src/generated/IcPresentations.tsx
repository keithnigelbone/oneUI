import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPresentations(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 15c0 1.1-.9 2-2 2h-5v1.38c.31.27.5.67.5 1.12 0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5c0-.45.19-.84.5-1.12V17H6c-1.1 0-2-.9-2-2V7h16zm0-12c.55 0 1 .45 1 1s-.45 1-1 1H4c-.55 0-1-.45-1-1s.45-1 1-1z"
          />
    </Svg>
  );
}
