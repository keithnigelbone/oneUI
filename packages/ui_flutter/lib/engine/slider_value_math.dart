/// Shared slider value math — clamp, snap, range normalization.
library;

List<double> normalizeSliderValues(Object? source, {bool isRange = false}) {
  if (source is List<double>) return List<double>.from(source);
  if (source is List<num>) return source.map((e) => e.toDouble()).toList();
  if (source is List) {
    return source.map((e) => (e as num).toDouble()).toList();
  }
  if (source is num) return [source.toDouble()];
  return isRange ? [0.0, 0.0] : [0.0];
}

double clampSliderValue(double value, double min, double max) {
  if (max <= min) return min;
  return value.clamp(min, max);
}

double snapSliderValue(double value, double min, double max, double step) {
  if (step <= 0 || max <= min) return clampSliderValue(value, min, max);
  final steps = ((value - min) / step).round();
  final snapped = min + steps * step;
  return clampSliderValue(snapped, min, max);
}

double valueToFraction(double value, double min, double max) {
  if (max <= min) return 0;
  return ((value - min) / (max - min)).clamp(0.0, 1.0);
}

double fractionToValue(double fraction, double min, double max, {double step = 0}) {
  final raw = min + fraction.clamp(0.0, 1.0) * (max - min);
  if (step > 0) return snapSliderValue(raw, min, max, step);
  return raw;
}

/// Enforce minimum step gap between range thumbs.
List<double> enforceRangeSeparation(
  List<double> values,
  int thumbIndex,
  double newValue,
  double min,
  double max,
  double step,
  int? minStepsBetweenValues,
) {
  final next = List<double>.from(values);
  next[thumbIndex] = clampSliderValue(newValue, min, max);
  if (next.length < 2 || minStepsBetweenValues == null) return next;

  final gap = minStepsBetweenValues * step;
  if (thumbIndex == 0) {
    final upper = next[1] - gap;
    if (next[0] > upper) next[0] = upper;
  } else {
    final lower = next[0] + gap;
    if (next[1] < lower) next[1] = lower;
  }
  return next.map((v) => clampSliderValue(v, min, max)).toList();
}

int tickCountForSteps(double min, double max, double step) {
  if (step <= 0 || max <= min) return 0;
  return ((max - min) / step).floor() + 1;
}
