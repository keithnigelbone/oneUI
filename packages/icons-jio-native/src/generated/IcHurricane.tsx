import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHurricane(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19.76 3.7c.4-.25.24-.86-.22-.92-9-1.11-13.58 3.4-14.39 7.8 0 .02 0 .04-.01.06-.03.19-.07.39-.09.58-.03.26-.05.52-.05.78 0 1.94.79 3.7 2.07 4.97L7 17s0 1.56-2.76 3.3c-.4.25-.24.86.22.92 9 1.11 13.58-3.4 14.39-7.8 0-.02 0-.04.01-.06.03-.19.07-.39.09-.58.03-.26.05-.52.05-.78 0-1.94-.79-3.7-2.07-4.97L17 7s0-1.56 2.76-3.3M12 15c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3"
          />
    </Svg>
  );
}
