import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcGardenPlants(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21 12a2.5 2.5 0 0 0-2.5-2.5H18l.32-.33a2.5 2.5 0 0 0-3.53-3.53L14.5 6v-.5a2.5 2.5 0 0 0-5 0V6l-.33-.32a2.5 2.5 0 0 0-3.53 3.49L6 9.5h-.5a2.5 2.5 0 0 0 0 5H6l-.32.33a2.5 2.5 0 0 0 3.53 3.53L9.5 18v.46a2.5 2.5 0 0 0 5 0V18l.33.32a2.5 2.5 0 0 0 3.53-3.53L18 14.5h.46A2.5 2.5 0 0 0 21 12m-9 3a3 3 0 1 1 0-5.999A3 3 0 0 1 12 15"
          />
    </Svg>
  );
}
