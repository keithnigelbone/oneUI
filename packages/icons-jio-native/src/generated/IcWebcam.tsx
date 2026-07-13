import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWebcam(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            fillRule="evenodd"
            d="M5 4h14c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2m9 4c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2"
            clipRule="evenodd"
          />
          <Path
            fill={fill}
            d="M12.77 11h-1.54c-.68 0-1.23.55-1.23 1.23v6.54c0 .68.55 1.23 1.23 1.23h1.54c.68 0 1.23-.55 1.23-1.23v-6.54c0-.68-.55-1.23-1.23-1.23"
          />
          <Path
            fill={fill}
            d="M15.57 17H8.43C7.64 17 7 17.67 7 18.5S7.64 20 8.43 20h7.14c.79 0 1.43-.67 1.43-1.5s-.64-1.5-1.43-1.5"
          />
    </Svg>
  );
}
