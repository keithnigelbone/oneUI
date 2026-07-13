import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCup(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 4.28V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v1.28a4.46 4.46 0 0 0 .28 8.52A6 6 0 0 0 11 16.91V20H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-3.09a6 6 0 0 0 4.72-4.11A4.46 4.46 0 0 0 18 4.28M6 10.49a2.47 2.47 0 0 1 0-4zm7.8-2-.57.51.14.79a.49.49 0 0 1-.5.58.46.46 0 0 1-.23-.06l-.7-.37-.71.37a.49.49 0 0 1-.52 0 .51.51 0 0 1-.2-.49l.13-.82-.57-.55A.5.5 0 0 1 10 8a.47.47 0 0 1 .4-.34l.79-.12.35-.71a.52.52 0 0 1 .89 0l.36.71.78.12a.5.5 0 0 1 .41.34.49.49 0 0 1-.18.46zm4.2 2v-4a2.47 2.47 0 0 1 0 4"
          />
    </Svg>
  );
}
