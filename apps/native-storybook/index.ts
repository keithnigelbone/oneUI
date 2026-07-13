// MUST be first — installs the DOMException shim before Storybook core loads.
import './polyfills';
import { registerRootComponent } from 'expo';
// react-native-gesture-handler's RootView must be mounted before the app root.
import 'react-native-gesture-handler';
import App from './App';

registerRootComponent(App);
