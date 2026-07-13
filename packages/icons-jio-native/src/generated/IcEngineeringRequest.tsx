import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcEngineeringRequest(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 13a3.8 3.8 0 0 0-1 .15L10.85 8q.142-.49.15-1a4 4 0 0 0-4-4h-.21a1 1 0 0 0-.65 1.7l.86.89L5.59 7l-.87-.86a1 1 0 0 0-1-.21 1 1 0 0 0-.72.84A2 2 0 0 0 3 7a4 4 0 0 0 4 4 3.8 3.8 0 0 0 1-.15L13.15 16a3.8 3.8 0 0 0-.15 1 4 4 0 1 0 4-4m0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0-8a4 4 0 0 0 4-4 1 1 0 0 0 0-.2 1 1 0 0 0-1.7-.66l-.89.86L17 5.59l.86-.87a1 1 0 0 0 .21-1 1 1 0 0 0-.84-.72H17a4 4 0 1 0 0 8M7 13a4 4 0 0 0-4 4 1 1 0 0 0 0 .2 1 1 0 0 0 1.7.66l.89-.86L7 18.41l-.86.87a1 1 0 0 0 .63 1.67L7 21a4 4 0 1 0 0-8"
          />
    </Svg>
  );
}
