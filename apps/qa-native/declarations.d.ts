// Stops `tsc` from complaining when the project graph walks into
// web-only `@oneui/ui` source files that import CSS modules. Native
// code never actually imports `.module.css`.
declare module '*.module.css' {
  const content: Record<string, string>;
  export default content;
}

// The JDS icons package ships JS without .d.ts. We only feed the whole
// module to `initJdsJioIcons` (no direct usage of individual icons), so a
// loose ambient declaration is sufficient — components reference glyphs
// by semantic name (`<Icon icon='add' />`) after the loader is registered.
declare module '@jds/core-icons--react-native';
