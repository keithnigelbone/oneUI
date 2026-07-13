import React from 'react';
import Svg, { ClipPath, Defs, G, Path, type SvgProps } from 'react-native-svg';
export function IcRadioOff(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <G clipPath="url(#ic_radio_off_svg__a)">
            <Path
              fill={fill}
              d="M12 0C5.38 0 0 5.38 0 12s5.38 12 12 12 12-5.38 12-12S18.62 0 12 0m0 21.6c-5.3 0-9.6-4.3-9.6-9.6S6.7 2.4 12 2.4s9.6 4.3 9.6 9.6-4.3 9.6-9.6 9.6"
            />
          </G>
          <Defs>
            <ClipPath id="ic_radio_off_svg__a">
              <Path fill="#fff" d="M0 0h24v24H0z" />
            </ClipPath>
          </Defs>
    </Svg>
  );
}
