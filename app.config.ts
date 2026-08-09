import type { ConfigContext, ExpoConfig } from '@expo/config';
import { ClientEnv } from './env';
import pkg from './package.json';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: pkg.name,
  slug: 'nova',
  version: pkg.version,
  scheme: `com.${pkg.name.toLowerCase()}`,
  userInterfaceStyle: 'light',
  orientation: 'portrait',
  icon: './assets/icon.png',
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
  },
  extra: {
    ...ClientEnv,
  },
  experiments: {
    typedRoutes: true,
  },
  plugins: [
    'expo-font',
    'expo-router',
    'expo-status-bar',
    'expo-sqlite',
    [
      'expo-dev-client',
      {
        launchMode: 'most-recent',
        defaultLaunchUrl: 'http://localhost:8081',
        android: {
          defaultLaunchUrl: 'http://10.0.0.2/8081',
        },
      },
    ],
  ],
});
