import { StatusBar } from '@components';
import { ThemeProvider } from '@shopify/restyle';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import db from '@/lib/db';
import { useAppState } from '@/lib/state';
import { dark, light } from '@/lib/theme';
import migrations from '../../drizzle/migrations';

export default function Layout() {
  const { error } = useMigrations(db, migrations);
  const colorTheme = useAppState((state) => state.theme);
  const [fontsLoaded] = useFonts({
    GeistMonoMedium: require('../assets/fonts/GeistMono-Medium.otf'),
    GeistMonoRegular: require('../assets/fonts/GeistMono-Regular.otf'),
    RajdhaniSemiBold: require('../assets/fonts/Rajdhani-SemiBold.ttf'),
    RajdhaniMedium: require('../assets/fonts/Rajdhani-Medium.ttf'),
    SatoshiBold: require('../assets/fonts/Satoshi-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return null;
  }

  if (error) {
    console.error(error);
    throw new Error(`Something went wrong ${error.message}`, {
      cause: error.cause,
    });
  }

  return (
    <ThemeProvider theme={colorTheme === 'dark' ? dark : light}>
      <StatusBar
        backgroundColor="background"
        style={colorTheme === 'light' ? 'dark' : 'light'}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="import" />
      </Stack>
    </ThemeProvider>
  );
}
