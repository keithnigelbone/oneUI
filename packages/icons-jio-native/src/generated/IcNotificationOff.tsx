import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcNotificationOff(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
                d='M12 2a8 8 0 00-8 8v5.76L16.42 3.34A7.89 7.89 0 0012 2zm9 14h-1v-6a8.001 8.001 0 00-.89-3.66L20.49 5a1.055 1.055 0 00-.745-1.799A1.053 1.053 0 0019 3.51L3.51 19A1.055 1.055 0 005 20.49L7.44 18H21a1 1 0 100-2zm-9 6a3 3 0 003-3H9a3 3 0 003 3z'
                fill='currentColor'
              />
    </Svg>
  );
}
