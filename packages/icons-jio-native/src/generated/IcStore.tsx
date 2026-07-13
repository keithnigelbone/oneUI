import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcStore(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m21.12 5.88-2.55-2.35A2 2 0 0 0 17.22 3H6.78a2 2 0 0 0-1.35.53L2.88 5.88a3 3 0 0 0 4.24 4.24q.114-.123.21-.26a3 3 0 0 0 4.67 0 3 3 0 0 0 4.67 0q.098.137.21.26a3 3 0 1 0 4.24-4.24M7.34 12.42a5 5 0 0 1-4.34.16V18a3 3 0 0 0 3 3h5v-8.19a4.91 4.91 0 0 1-3.66-.39m9.32 0a4.9 4.9 0 0 1-3.66.39V15h2a1 1 0 0 1 0 2h-2v4h5a3 3 0 0 0 3-3v-5.42a5 5 0 0 1-4.34-.16"
          />
    </Svg>
  );
}
