import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcManager(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10.78 10.84a4.51 4.51 0 0 0 5.56-5.56 4.46 4.46 0 0 0-3.12-3.12 4.51 4.51 0 0 0-5.56 5.56 4.46 4.46 0 0 0 3.12 3.12m4.49 1.86-.38.75a1 1 0 0 1-.73.54H14a1 1 0 0 1-.71-.29L12 12.41l-1.29 1.3A1 1 0 0 1 10 14h-.16a1 1 0 0 1-.73-.54l-.38-.75A8 8 0 0 0 4 20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 8 8 0 0 0-4.73-7.3M10 20H8a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
