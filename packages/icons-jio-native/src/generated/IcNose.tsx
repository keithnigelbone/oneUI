import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcNose(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m20.19 13.41-2.39-1.33-1.1-4.41A4.836 4.836 0 0 0 12 4C9.77 4 7.84 5.51 7.3 7.67l-1.1 4.41-2.39 1.33C2.69 14.03 2 15.21 2 16.49c0 1.94 1.58 3.52 3.52 3.52h1.91a4.9 4.9 0 0 1-.42-2h-1c-.55 0-1-.45-1-1s.45-1 1-1h1c1.1 0 2 .9 2 2 0 1.65 1.35 3 3 3s3-1.35 3-3c0-1.1.9-2 2-2h1c.55 0 1 .45 1 1s-.45 1-1 1h-1c0 .71-.15 1.39-.42 2h1.91c1.94 0 3.52-1.58 3.52-3.52 0-1.28-.69-2.46-1.81-3.08z"
          />
    </Svg>
  );
}
