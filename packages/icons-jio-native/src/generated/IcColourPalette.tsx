import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcColourPalette(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21.8 10A10 10 0 1 0 12 22a3 3 0 0 0 3-3v-1.72A2.08 2.08 0 0 1 17 15h2a3 3 0 0 0 3-3c0-.672-.067-1.342-.2-2M6.44 7.44a1.5 1.5 0 1 1 0 2.12 1.49 1.49 0 0 1 0-2.12M6.5 15a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m4.06 3.56a1.5 1.5 0 1 1 0-2.12 1.49 1.49 0 0 1 0 2.12M12 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5.56 1.56a1.5 1.5 0 1 1 0-2.12 1.49 1.49 0 0 1 0 2.12"
          />
    </Svg>
  );
}
