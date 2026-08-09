import { Box, Card, Text } from '@atoms';
import { TouchableOpacity } from '@components';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    />
  );
}

function TabBar({ state }: BottomTabBarProps) {
  return (
    <Box backgroundColor="background" paddingVertical="l">
      <Card
        paddingHorizontal="m"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
        variant="hairlineTop"
        height={70}
      >
        {state.routes.map((route) => (
          <TouchableOpacity key={route.key}>
            <Text variant="label">
              {route.name === 'index' ? 'Library' : route.name}
            </Text>
          </TouchableOpacity>
        ))}
      </Card>
    </Box>
  );
}
