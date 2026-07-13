import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTicketPnrNumber(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7.78 13h1.94l.5-2H8.28zM19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m-6 7h-.72l-.5 2H12a1 1 0 0 1 0 2h-.72L11 16.24a1.029 1.029 0 0 1-2-.48l.22-.76H7.28L7 16.24a1.028 1.028 0 1 1-2-.48l.22-.76H5a1 1 0 0 1 0-2h.72l.5-2H6a1 1 0 0 1 0-2h.72L7 7.76a1.028 1.028 0 1 1 2 .48L8.78 9h1.94L11 7.76a1.029 1.029 0 0 1 2 .48l-.22.76H13a1 1 0 1 1 0 2m4 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
