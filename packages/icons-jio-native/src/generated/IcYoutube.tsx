import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcYoutube(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
                d='M21.58 7.19a2.51 2.51 0 00-1.77-1.77C18.26 5 12 5 12 5s-6.26 0-7.81.42a2.51 2.51 0 00-1.77 1.77A25.83 25.83 0 002 12a25.83 25.83 0 00.42 4.81 2.51 2.51 0 001.77 1.77C5.74 19 12 19 12 19s6.26 0 7.81-.42a2.51 2.51 0 001.77-1.77c.29-1.587.43-3.197.42-4.81.01-1.613-.13-3.223-.42-4.81zM10 15V9l5.19 3L10 15z'
                fill='currentColor'
              />
    </Svg>
  );
}
