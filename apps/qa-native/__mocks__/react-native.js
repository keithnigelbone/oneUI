'use strict';
// Manual CJS mock for react-native — used by Vitest when loading RNTL in Node.
// Provides the subset of RN APIs that @testing-library/react-native
// (host-component-names detection) and our components require.

// React is needed to implement Pressable as a real function component so that
// its render-prop children pattern is called (otherwise RNTL sees an empty tree).
const React = require('react');

function flattenStyle(s) {
  if (!s) return {};
  if (Array.isArray(s)) {
    return s.reduce(function (acc, item) {
      return Object.assign(acc, flattenStyle(item));
    }, {});
  }
  return s;
}

const StyleSheet = {
  create: (s) => s,
  flatten: flattenStyle,
  hairlineWidth: 1,
  absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
};

const Platform = {
  OS: 'ios',
  select: (o) => o.ios ?? o.default,
  Version: 16,
};

// Host components — strings so react-test-renderer can identify them
const View = 'View';
const Text = 'Text';
const TextInput = 'TextInput';
const Image = 'Image';
const Modal = 'Modal';
const Switch = 'Switch';
const ScrollView = 'ScrollView';
// Pressable uses a render-prop pattern: children can be a function
// ({ pressed }) => ReactNode. As a plain string host component, react-test-renderer
// never calls that function and the content tree is empty. This function component
// calls the render prop so RNTL can query text and elements inside it.
function Pressable(props) {
  var resolvedChildren = typeof props.children === 'function'
    ? props.children({ pressed: false })
    : props.children;
  // Spread all props (including accessibilityRole, accessibilityLabel, etc.)
  // onto a 'Pressable' host element so RNTL role/label queries still work.
  var { children: _c, ...rest } = props;
  return React.createElement('Pressable', rest, resolvedChildren);
}
const TouchableOpacity = 'TouchableOpacity';
const TouchableHighlight = 'TouchableHighlight';
const TouchableWithoutFeedback = 'TouchableWithoutFeedback';
const FlatList = 'FlatList';
const SectionList = 'SectionList';
const ActivityIndicator = 'ActivityIndicator';
const SafeAreaView = 'SafeAreaView';
const KeyboardAvoidingView = 'KeyboardAvoidingView';

const Animated = {
  Value: function (val) {
    return {
      _value: val,
      setValue: function () {},
      addListener: function () {},
      removeListener: function () {},
      interpolate: function () { return this; },
    };
  },
  timing: function () { return { start: function (cb) { if (cb) cb({ finished: true }); } }; },
  spring: function () { return { start: function (cb) { if (cb) cb({ finished: true }); } }; },
  sequence: function () { return { start: function (cb) { if (cb) cb({ finished: true }); } }; },
  parallel: function () { return { start: function (cb) { if (cb) cb({ finished: true }); } }; },
  loop: function () { return { start: function (cb) { if (cb) cb({ finished: true }); }, stop: function () {}, reset: function () {} }; },
  delay: function () { return { start: function (cb) { if (cb) cb({ finished: true }); } }; },
  createAnimatedComponent: function (comp) { return comp; },
  View: 'View',
  Text: 'Text',
  Image: 'Image',
  ScrollView: 'ScrollView',
};

const AccessibilityInfo = {
  isReduceMotionEnabled: function () { return Promise.resolve(false); },
  isScreenReaderEnabled: function () { return Promise.resolve(false); },
  addEventListener: function () { return { remove: function () {} }; },
};

function useColorScheme() { return 'light'; }
function useWindowDimensions() { return { width: 375, height: 812, scale: 2, fontScale: 1 }; }

const Dimensions = {
  get: function () { return { width: 375, height: 812, scale: 2, fontScale: 1 }; },
  addEventListener: function () { return { remove: function () {} }; },
};

// Easing — used by Spinner/Progress components for animation curves.
const Easing = {
  linear: function (t) { return t; },
  ease: function (t) { return t; },
  quad: function (t) { return t * t; },
  cubic: function (t) { return t * t * t; },
  inOut: function (easing) { return easing; },
  out: function (easing) { return easing; },
  in: function (easing) { return easing; },
  bezier: function () { return function (t) { return t; }; },
  circle: function (t) { return t; },
  sin: function (t) { return t; },
  exp: function (t) { return t; },
  bounce: function (t) { return t; },
  back: function () { return function (t) { return t; }; },
  elastic: function () { return function (t) { return t; }; },
  poly: function () { return function (t) { return t; }; },
};

// Touchable — required by react-native-svg (SvgTouchableMixin) which destructures
// Touchable.Mixin. Provide a minimal stub to prevent crashes at load time.
const Touchable = {
  Mixin: {
    touchableGetInitialState: function () { return {}; },
    touchableHandleStartShouldSetResponder: function () { return false; },
    touchableHandleResponderTerminationRequest: function () { return true; },
    touchableHandleResponderGrant: function () {},
    touchableHandleResponderMove: function () {},
    touchableHandleResponderRelease: function () {},
    touchableHandleResponderTerminate: function () {},
    touchableGetHighlightDelayMS: function () { return 0; },
    touchableGetLongPressDelayMS: function () { return 500; },
    touchableGetPressRectOffset: function () { return { top: 0, left: 0, right: 0, bottom: 0 }; },
  },
};

module.exports = {
  StyleSheet,
  Platform,
  View,
  Text,
  TextInput,
  Image,
  Modal,
  Switch,
  ScrollView,
  Pressable,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  FlatList,
  SectionList,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Animated,
  AccessibilityInfo,
  useColorScheme,
  useWindowDimensions,
  Dimensions,
  Easing,
  Touchable,
  // processColor — used by react-native-svg internals
  processColor: function (color) { return color; },
  // PanResponder — used by react-native-svg extractResponder to enumerate panHandler keys
  PanResponder: {
    create: function () {
      return {
        panHandlers: {
          onMoveShouldSetResponder: null,
          onMoveShouldSetResponderCapture: null,
          onResponderEnd: null,
          onResponderGrant: null,
          onResponderMove: null,
          onResponderReject: null,
          onResponderRelease: null,
          onResponderStart: null,
          onResponderTerminate: null,
          onResponderTerminationRequest: null,
          onStartShouldSetResponder: null,
          onStartShouldSetResponderCapture: null,
        },
      };
    },
  },
  // required by RNTL internals
  findNodeHandle: function () { return null; },
  AppState: { addEventListener: function () { return { remove: function () {} }; }, currentState: 'active' },
};
