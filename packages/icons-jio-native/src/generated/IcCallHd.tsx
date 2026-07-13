import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCallHd(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15.56 15.86a2 2 0 0 0-2.83 0l-.7.71a1 1 0 0 1-1.42 0l-4.24-4.24a1 1 0 0 1 0-1.42l.71-.7a2 2 0 0 0 0-2.83l-.71-.71a2 2 0 0 0-2.83 0l-1 1A2 2 0 0 0 2 8.79c-.17 1.41-.07 4.75 3.67 8.49s7.08 3.84 8.49 3.67a2 2 0 0 0 1.13-.56l1-1a2 2 0 0 0 0-2.83zm2.69-8.36h-.5v3h.5a1.5 1.5 0 1 0 0-3M20 5h-8a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-4.25 6a.5.5 0 1 1-1 0V9.5h-2V11a.5.5 0 1 1-1 0V7a.5.5 0 0 1 1 0v1.5h2V7a.5.5 0 0 1 1 0zm2.5.5h-1a.5.5 0 0 1-.5-.5V7a.5.5 0 0 1 .5-.5h1a2.5 2.5 0 1 1 0 5"
          />
    </Svg>
  );
}
