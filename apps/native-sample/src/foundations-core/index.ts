/**
 * Barrel for the foundations-core slice (a vendored subset of
 * OneUIFoundationsApp's @oneui/core package). Only the bits the four
 * v4-sample foundation pages need — dimensions, spacings, shapes, strokes,
 * plus the trimmed BrandDef.
 */

export * from './dimensions';
export * from './dimensionLogic';
export * from './dimensionTypes';

export * from './spacings';
export * from './spacingLogic';
export * from './spacingTypes';

export * from './shapes';
export * from './shapeLogic';
export * from './shapeTypes';

export * from './strokes';
export * from './strokeLogic';
export * from './strokeTypes';

export * from './themes';
