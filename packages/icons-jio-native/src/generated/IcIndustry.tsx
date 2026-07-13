import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcIndustry(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M5 6a1 1 0 0 1-.71-1.71 3.67 3.67 0 0 1 4-.76c1 .25 1.48.34 2-.24a1.003 1.003 0 1 1 1.42 1.42 3.67 3.67 0 0 1-4 .76c-1-.25-1.48-.34-2 .24A1 1 0 0 1 5 6M20.55 10.17a1 1 0 0 0-.94-.09L16 11.63V11a1 1 0 0 0-1.39-.92L11 11.63V11a1 1 0 0 0-1.39-.92L7 11.2V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a1 1 0 0 0-.45-.83M9 16.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5zm4 0a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5zm4 0a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z"
          />
    </Svg>
  );
}
