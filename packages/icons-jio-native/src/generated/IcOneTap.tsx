import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcOneTap(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a8 8 0 0 0-8 8 8 8 0 0 0 .09 1.14 1.01 1.01 0 0 0 2-.28A5.5 5.5 0 0 1 6 10a6 6 0 1 1 12 0q0 .433-.07.86a1 1 0 0 0 .85 1.14h.14a1 1 0 0 0 1-.86q.081-.568.08-1.14a8 8 0 0 0-8-8m0 4a4 4 0 0 0-4 4v11a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V10a4 4 0 0 0-4-4m2 5.5a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V10a2 2 0 1 1 4 0z"
          />
    </Svg>
  );
}
