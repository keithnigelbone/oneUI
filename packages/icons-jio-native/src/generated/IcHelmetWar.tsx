import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHelmetWar(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M11.47 2A8.18 8.18 0 0 0 4 10.27v8.12a3 3 0 0 0 1.34 2.5l.66.41a1 1 0 0 0 1.49-.48l2.05-5.47A1 1 0 0 0 8.56 14H8a2 2 0 0 1-2-2h4a1 1 0 0 1 1 1v4a1 1 0 0 0 2 0v-4a1 1 0 0 1 1-1h4a2 2 0 0 1-2 2h-.56a1 1 0 0 0-.93 1.35l2 5.47a1.002 1.002 0 0 0 1.49.48l.61-.41a3 3 0 0 0 1.39-2.5V10a8 8 0 0 0-8.53-8"
          />
    </Svg>
  );
}
