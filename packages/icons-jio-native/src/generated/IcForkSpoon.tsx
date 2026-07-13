import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcForkSpoon(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10 3a1.06 1.06 0 0 0-1 1.11V11H8V4a1 1 0 0 0-.29-.71A1.05 1.05 0 0 0 7 3a1 1 0 0 0-.71.29A1 1 0 0 0 6 4v7H5V4.11a1.1 1.1 0 0 0-.27-.76A1.08 1.08 0 0 0 4 3a1.06 1.06 0 0 0-1 1.11V12a1 1 0 0 0 .29.71A1 1 0 0 0 4 13h2v7a1 1 0 0 0 .29.71A1 1 0 0 0 7 21a1.05 1.05 0 0 0 .71-.29A1 1 0 0 0 8 20v-7h2a1.05 1.05 0 0 0 .71-.29A1 1 0 0 0 11 12V4.11a1.1 1.1 0 0 0-.27-.76A1.08 1.08 0 0 0 10 3m7 0c-2.21 0-4 2.46-4 5.5 0 2.56 1.28 4.71 3 5.32V20a1 1 0 0 0 2 0v-6.18c1.72-.61 3-2.76 3-5.32C21 5.46 19.21 3 17 3"
          />
    </Svg>
  );
}
