import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMusicAlbum(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-1 12a2 2 0 1 1-2-2V8.34l-5 1.48V16a2 2 0 1 1-2-2V9.08a1 1 0 0 1 .71-1l7-2.08a1 1 0 0 1 1.194.53A1 1 0 0 1 17 7z"
          />
    </Svg>
  );
}
