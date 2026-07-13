import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcJewelleryRing(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m13.25 6.11 1.29-1.44a1 1 0 0 0 0-1.34l-.9-1A1 1 0 0 0 12.9 2h-1.8a1 1 0 0 0-.74.33l-.9 1a1 1 0 0 0 0 1.34l1.29 1.44a8 8 0 1 0 2.5 0M12 20a6 6 0 1 1 0-12 6 6 0 0 1 0 12"
          />
    </Svg>
  );
}
