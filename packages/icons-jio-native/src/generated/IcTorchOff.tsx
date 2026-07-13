import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTorchOff(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17.41 12.41a2 2 0 0 0 .44-2.18A2 2 0 0 0 16 9h-2.76L17 12.79zm-.59-4.84 1.72-2.45a.999.999 0 0 0-.996-1.628A1 1 0 0 0 16.9 4l-1.72 2.43a1.001 1.001 0 1 0 1.64 1.14m3.89 11.72-16-16a1.004 1.004 0 0 0-1.42 1.42l4.35 4.34a2 2 0 0 0-1 3.36L9 14.83V19a3 3 0 0 0 6 0v-2.59l4.29 4.3a1 1 0 0 0 1.639-.325 1 1 0 0 0-.22-1.095M12 16a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-9a1 1 0 0 0 1-1V3a1 1 0 1 0-2 0v3a1 1 0 0 0 1 1"
          />
    </Svg>
  );
}
