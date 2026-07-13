import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTeamMembers(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m6 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M6 16a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m12 1a3 3 0 0 0-3 3 1 1 0 0 0 1 1h4a1 1 0 0 0 1-1 3 3 0 0 0-3-3M6 17a3 3 0 0 0-3 3 1 1 0 0 0 1 1h4a1 1 0 0 0 1-1 3 3 0 0 0-3-3m8.45-1.89L13 14.38V13a1 1 0 0 0-2 0v1.38l-1.45.73A1 1 0 0 0 10 17a.93.93 0 0 0 .45-.11l1.55-.77 1.55.77A.93.93 0 0 0 14 17a1 1 0 0 0 .45-1.89M10 10h4a1 1 0 0 0 1-1 3 3 0 0 0-6 0 1 1 0 0 0 1 1"
          />
    </Svg>
  );
}
