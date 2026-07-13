import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPhotoCamera(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 6h-7V5a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v1H5a3.12 3.12 0 0 0-3 3.23v7.54A3.12 3.12 0 0 0 5 20h14a3.12 3.12 0 0 0 3-3.23V9.23A3.12 3.12 0 0 0 19 6m-7 10a3 3 0 1 1 0-5.999A3 3 0 0 1 12 16"
          />
    </Svg>
  );
}
