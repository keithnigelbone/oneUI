'use strict';
// Manual CJS mock for react-native-svg.
// The real library loads TypeScript source files via CJS require() when the
// 'react-native' resolve condition is active, causing SyntaxError in Node.
// We stub out the subset of exports that our components use.

const Svg = 'Svg';
const Circle = 'Circle';
const Path = 'Path';
const Rect = 'Rect';
const G = 'G';
const Defs = 'Defs';
const ClipPath = 'ClipPath';
const Use = 'Use';
const Ellipse = 'Ellipse';
const Line = 'Line';
const Polygon = 'Polygon';
const Polyline = 'Polyline';
const Text = 'SvgText';
const TSpan = 'TSpan';
const TextPath = 'TextPath';
const Image = 'SvgImage';
const Symbol = 'SvgSymbol';
const LinearGradient = 'LinearGradient';
const RadialGradient = 'RadialGradient';
const Stop = 'Stop';
const Mask = 'Mask';
const Pattern = 'Pattern';
const Marker = 'Marker';
const ForeignObject = 'ForeignObject';

// SvgXml — used in Button and other components for inline SVG markup
const SvgXml = 'SvgXml';

// SvgUri — used for remote SVGs
const SvgUri = 'SvgUri';

module.exports = {
  default: Svg,
  Svg,
  Circle,
  Path,
  Rect,
  G,
  Defs,
  ClipPath,
  Use,
  Ellipse,
  Line,
  Polygon,
  Polyline,
  Text,
  TSpan,
  TextPath,
  Image,
  Symbol,
  LinearGradient,
  RadialGradient,
  Stop,
  Mask,
  Pattern,
  Marker,
  ForeignObject,
  SvgXml,
  SvgUri,
};
