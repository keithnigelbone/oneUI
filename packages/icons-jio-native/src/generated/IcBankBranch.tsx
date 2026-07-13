import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBankBranch(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 19h-2v-9h1a2 2 0 0 0 .79-3.84l-7-3a2.06 2.06 0 0 0-1.58 0l-7 3A2 2 0 0 0 5 10h1v9H4a1 1 0 0 0 0 2h16a1 1 0 1 0 0-2m-4 0h-3v-9h3zm-8-9h3v9H8z"
          />
    </Svg>
  );
}
