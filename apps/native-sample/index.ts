import { registerRootComponent } from 'expo';
// Ensure react-native-gesture-handler's RootView is mounted before the app
// root — required by React Navigation Drawer + Stack on iOS / Android.
import 'react-native-gesture-handler';
import App from './App';

registerRootComponent(App);
