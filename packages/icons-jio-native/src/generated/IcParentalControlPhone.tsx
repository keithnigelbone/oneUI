import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcParentalControlPhone(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 5.28V5a3 3 0 0 0-6 0v.27A2 2 0 0 0 12 7v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V7a2 2 0 0 0-1-1.72M16 10a1 1 0 1 1 0-2 1 1 0 0 1 0 2m-1-5a1 1 0 0 1 2 0zm-5 6V6a5.93 5.93 0 0 1 1.54-4H9a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-4h-4a4 4 0 0 1-4-4m2 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
