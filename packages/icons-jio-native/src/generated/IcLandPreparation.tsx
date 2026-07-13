import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcLandPreparation(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.45 13.28c-.28-.14-1.89-.78-5.82.79-1.7.68-2.46 0-3.88-1.59S7.4 8.81 3.68 10.05A1 1 0 0 0 3 11v9a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-5.83a1 1 0 0 0-.55-.89M14 12h1.17a3 3 0 0 0 2.12-.88l2.42-2.41a1 1 0 0 0 0-1.42l-.8-.79 1.8-1.79a1.004 1.004 0 1 0-1.42-1.42l-1.79 1.8-.79-.8a1 1 0 0 0-1.42 0l-2.41 2.42A3 3 0 0 0 12 8.83V10a2 2 0 0 0 2 2"
          />
    </Svg>
  );
}
