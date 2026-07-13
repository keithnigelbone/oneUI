import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcIncognito(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 17h-1.11a3 3 0 0 0-5.63 0h-2.44a3 3 0 0 0-5.64 0H4a1 1 0 0 0 0 2h1.18a3 3 0 0 0 5.64 0h2.44a3 3 0 0 0 5.63 0H20a1 1 0 1 0 0-2m1-6h-1.56l-2.51-6.75a1.94 1.94 0 0 0-1.2-1.16 1.82 1.82 0 0 0-1.56.2 5.15 5.15 0 0 1-4.34 0 1.82 1.82 0 0 0-1.56-.2 1.94 1.94 0 0 0-1.2 1.16L4.56 11H3a1 1 0 0 0 0 2h18a1 1 0 1 0 0-2"
          />
    </Svg>
  );
}
