import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWeightManagement(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17.05 5.68h-1.3A5.06 5.06 0 0 0 11.99 4c-1.49 0-2.83.66-3.76 1.68h-1.3c-1.4 0-2.53 1.13-2.53 2.53v9.26c0 1.4 1.13 2.53 2.53 2.53h10.11c1.4 0 2.53-1.13 2.53-2.53V8.21c0-1.4-1.13-2.53-2.53-2.53zM12 11.99c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3m0-4.63c-.46 0-.84.38-.84.84v.84c0 .46.38.84.84.84s.84-.38.84-.84V8.2c0-.46-.38-.84-.84-.84"
          />
    </Svg>
  );
}
