import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPhotoCrop(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M8.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M18 3h-3a1 1 0 1 0 0 2h3a1 1 0 0 1 1 1v3a1 1 0 0 0 2 0V6a3 3 0 0 0-3-3M4 10a1 1 0 0 0 1-1V6a1 1 0 0 1 1-1h3a1 1 0 0 0 0-2H6a3 3 0 0 0-3 3v3a1 1 0 0 0 1 1m12.21-.71a1 1 0 0 0-1.41 0l-4.29 4.3-1.29-1.3a1 1 0 0 0-1.41 0L5 15.09V15a1 1 0 1 0-2 0v3a3 3 0 0 0 3 3h3a1 1 0 0 0 0-2H6a1 1 0 0 1-1-1v-.09l3.5-3.5 1.29 1.3a1 1 0 0 0 1.41 0l4.29-4.3 3.5 3.5V18a1 1 0 0 1-1 1H15a1 1 0 0 0 0 2h3a3 3 0 0 0 3-3v-3.5a1 1 0 0 0-.29-.71z"
          />
    </Svg>
  );
}
