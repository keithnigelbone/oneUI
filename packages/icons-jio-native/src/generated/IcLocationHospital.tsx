import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcLocationHospital(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M14 7a1 1 0 0 0-1 1v1h-2V8a1 1 0 0 0-2 0v4a1 1 0 1 0 2 0v-1h2v1a1 1 0 0 0 2 0V8a1 1 0 0 0-1-1m3.57-2.92A7.8 7.8 0 0 0 12 1.93a7.82 7.82 0 0 0-8 7.6c0 5.08 5.91 11.14 6.59 11.81a2 2 0 0 0 2.82 0c.68-.67 6.59-6.73 6.59-11.81a7.8 7.8 0 0 0-2.43-5.45M12 15.86a5.93 5.93 0 0 1-1.16-11.75 6 6 0 0 1 3.43.34A5.93 5.93 0 0 1 12 15.86"
          />
    </Svg>
  );
}
