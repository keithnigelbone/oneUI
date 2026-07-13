class AnimatedValue {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  setValue(value: number) {
    this.value = value;
  }

  interpolate() {
    return this.value;
  }
}

const animation = {
  start: (callback?: () => void) => callback?.(),
  stop: () => {},
};

export const StyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T) => styles,
  flatten: (style: unknown) => style,
};

export const View = 'View';
export const Text = 'Text';
export const Pressable = 'Pressable';
export const ScrollView = 'ScrollView';
export const TextInput = 'TextInput';
export const Image = 'Image';
export const Switch = 'Switch';
export const Modal = 'Modal';

export const Animated = {
  Value: AnimatedValue,
  View: 'Animated.View',
  timing: () => animation,
  spring: () => animation,
  loop: () => animation,
};

export const Easing = {
  linear: (value: number) => value,
};

export const useColorScheme = () => 'light';

export const Platform = {
  OS: 'ios',
  select: (options: Record<string, unknown>) => options.ios ?? options.default,
};

export const AccessibilityInfo = {
  isReduceMotionEnabled: () => Promise.resolve(false),
  addEventListener: () => ({ remove: () => {} }),
};

export default {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  Switch,
  Modal,
  Animated,
  Easing,
  useColorScheme,
  Platform,
  AccessibilityInfo,
};
