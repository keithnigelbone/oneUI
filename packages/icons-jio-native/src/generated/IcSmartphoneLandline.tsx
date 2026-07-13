import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSmartphoneLandline(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M6 11a2 2 0 0 0 2-2V8a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1h4a4.2 4.2 0 0 1 1 .14V7.6a1.93 1.93 0 0 0-.4-1.2C19.72 5.28 17.29 3 12 3S4.28 5.28 3.4 6.4A1.93 1.93 0 0 0 3 7.6V9a2 2 0 0 0 2 2zm15.41-.41A2 2 0 0 0 20 10h-4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-8a2 2 0 0 0-.59-1.41m-2.7 9.12a1 1 0 0 1-1.27.12.94.94 0 0 1-.36-.45 1 1 0 0 1-.08-.58 1 1 0 0 1 .8-.8 1 1 0 0 1 .58.06.94.94 0 0 1 .45.36 1 1 0 0 1-.12 1.27zm-9.88-7.88A4 4 0 0 1 6 13a2 2 0 0 0-2 2v3a3 3 0 0 0 3 3h5.14a4.2 4.2 0 0 1-.14-1v-6a1.5 1.5 0 1 1 0-3h.14a4 4 0 0 1 1.24-2H10a4 4 0 0 1-1.17 2.83"
          />
    </Svg>
  );
}
