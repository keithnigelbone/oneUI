import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFirefighterManager(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 11c3.87 0 7-1.34 7-3 0-.94-1-1.78-2.58-2.33a4.5 4.5 0 0 0-8.84 0C6 6.22 5 7.06 5 8c0 1.66 3.13 3 7 3m0-7a1 1 0 1 1 0 2 1 1 0 0 1 0-2m2.47 8.39-1.9 1.41a1 1 0 0 1-1.2 0l-1.88-1.39A8 8 0 0 0 4 20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 8 8 0 0 0-5.53-7.61M17 18.5a.47.47 0 0 1-.15.35l-1 1a.48.48 0 0 1-.7 0l-1-1a.47.47 0 0 1-.15-.35v-2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5z"
          />
    </Svg>
  );
}
