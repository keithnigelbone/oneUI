import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCutScissor(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19.69 5.72a1 1 0 0 0-1.38-1.44l-3.49 3.33L16 3.25a1.031 1.031 0 0 0-2-.5l-2 7.51-2.19 2.15A3.4 3.4 0 0 0 9 11a3.58 3.58 0 0 0-5 0 3.5 3.5 0 0 0 2.5 6A3.5 3.5 0 0 0 9 16l2.13-2-1 3.68a3.5 3.5 0 0 0 3.39 4.39 3.5 3.5 0 0 0 3.37-2.59 3.51 3.51 0 0 0-2.47-4.29 3.44 3.44 0 0 0-1.56 0l1-3.81zM5.44 14.56a1.5 1.5 0 0 1 0-2.12 1.498 1.498 0 0 1 2.488.46 1.5 1.5 0 0 1-.368 1.66 1.53 1.53 0 0 1-2.12 0m8.45 2.53a1.51 1.51 0 1 1-1.063 2.827 1.51 1.51 0 0 1 1.063-2.827"
          />
    </Svg>
  );
}
