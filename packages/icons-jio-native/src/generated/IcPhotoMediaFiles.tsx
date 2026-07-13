import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPhotoMediaFiles(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M6 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2M20 2H9a2 2 0 0 0-2 2v6H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-6h3a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2m-7.29 12.29a1 1 0 0 0-1.42 0L8 17.59l-1.29-1.3a1 1 0 0 0-1.42 0L4 17.59V12h11v4.59zM17 12a2 2 0 0 0-2-2H9V4h11v8zm-3-5.92a.5.5 0 0 0-.78.42v2a.51.51 0 0 0 .26.44.5.5 0 0 0 .24.06.6.6 0 0 0 .28-.08l1.5-1a.51.51 0 0 0 0-.84z"
          />
    </Svg>
  );
}
