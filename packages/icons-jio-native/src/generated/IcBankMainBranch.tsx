import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBankMainBranch(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m21.63 6.1-9-3a2.1 2.1 0 0 0-1.26 0l-9 3A2 2 0 0 0 3 10v9a1 1 0 0 0 0 2h18a1 1 0 1 0 0-2v-9a2 2 0 0 0 .63-3.9M11 10v9H9v-9zm2 0h2v9h-2zm-8 0h2v9H5zm14 9h-2v-9h2z"
          />
    </Svg>
  );
}
