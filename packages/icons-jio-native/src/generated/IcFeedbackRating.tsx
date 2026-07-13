import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFeedbackRating(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 4H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h3v1a2 2 0 0 0 3.2 1.6l3.47-2.6H19a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m-7 9.71-1.32.69a.85.85 0 0 1-1.24-.9l.25-1.5-1.07-1a.86.86 0 0 1 .48-1.47l1.47-.22.66-1.31a.86.86 0 0 1 1.54 0l.66 1.33 1.47.22a.86.86 0 0 1 .48 1.45l-1.07 1 .25 1.47a.85.85 0 0 1-1.24.9z"
          />
    </Svg>
  );
}
