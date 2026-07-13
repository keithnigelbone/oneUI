import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDeployment(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m22 17.68-1-3a1 1 0 0 0-1-.68h-2.5a1 1 0 0 0 .81-.42 1 1 0 0 0 .14-.9l-1-3A1 1 0 0 0 16.5 9h-2a1 1 0 0 0 .81-.42 1 1 0 0 0 .14-.9l-1-3A1 1 0 0 0 13.5 4h-3a1 1 0 0 0-.95.68l-1 3a1 1 0 0 0 .14.9A1 1 0 0 0 9.5 9H7a1 1 0 0 0-1 .68l-1 3a1 1 0 0 0 .14.9A1 1 0 0 0 6 14H4a1 1 0 0 0-1 .68l-1 3a1 1 0 0 0 .14.9A1 1 0 0 0 3 19h18a1 1 0 0 0 .81-.42 1 1 0 0 0 .19-.9m-12.4-3L8.78 17h-.06L8 14.68A1 1 0 0 0 7 14h3.5a1 1 0 0 0-.95.68zm3-5L11.78 12h-.06L11 9.68A1 1 0 0 0 10 9h3.5a1 1 0 0 0-.95.68zm3.5 5L15.28 17h-.06l-.77-2.32a1 1 0 0 0-.95-.68H17a1 1 0 0 0-.95.68z"
          />
    </Svg>
  );
}
