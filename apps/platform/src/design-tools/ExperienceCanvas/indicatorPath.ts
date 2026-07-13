export function createRoundedRectIndicatorPath(
  width: number,
  height: number,
  radius: number = 8,
): Path2D {
  const path = new Path2D();
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));

  path.moveTo(r, 0);
  path.lineTo(width - r, 0);
  path.quadraticCurveTo(width, 0, width, r);
  path.lineTo(width, height - r);
  path.quadraticCurveTo(width, height, width - r, height);
  path.lineTo(r, height);
  path.quadraticCurveTo(0, height, 0, height - r);
  path.lineTo(0, r);
  path.quadraticCurveTo(0, 0, r, 0);
  path.closePath();

  return path;
}
