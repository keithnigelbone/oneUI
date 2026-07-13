import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBirthday(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M14 7h-4v2h4zm-2-1c.348 0 .682-.137.93-.38a1.3 1.3 0 0 0 .38-.93 1.28 1.28 0 0 0-.38-.92l-.67-.66a.36.36 0 0 0-.52 0l-.67.66a1.28 1.28 0 0 0-.38.92 1.3 1.3 0 0 0 .38.93c.248.243.582.38.93.38m-4.5 9a2.1 2.1 0 0 0 1.58-.75 4 4 0 0 1 5.83 0 2 2 0 0 0 3.17 0A4.44 4.44 0 0 1 20 13.12V12a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v1.12a4.5 4.5 0 0 1 1.91 1.13A2.12 2.12 0 0 0 7.5 15M20 19v-3.72q-.31.215-.59.47a4 4 0 0 1-5.83 0 2 2 0 0 0-3.17 0 4 4 0 0 1-5.83 0 4.3 4.3 0 0 0-.58-.46V19a1 1 0 0 0 0 2h16a1 1 0 1 0 0-2"
          />
    </Svg>
  );
}
