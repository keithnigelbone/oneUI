import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPharmacy(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19.56 12.9 18 12l1.56-.9a2 2 0 0 0 .73-2.73l-1-1.74a2 2 0 0 0-2.73-.73L15 6.8V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v1.8l-1.56-.9a2 2 0 0 0-2.73.73l-1 1.74a2 2 0 0 0 .73 2.73L6 12l-1.56.9a2 2 0 0 0-.73 2.73l1 1.74a2 2 0 0 0 2.73.73L9 17.2V19a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-1.8l1.56.9a2 2 0 0 0 2.73-.73l1-1.74a2 2 0 0 0-.73-2.73M14 13h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1v-1a1 1 0 1 1 2 0v1h1a1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
