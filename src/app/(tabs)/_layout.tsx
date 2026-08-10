import { Box, Card, Icon, Text } from '@atoms';
import { TouchableOpacity } from '@components';
import { router, Tabs } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    />
  );
}

function TabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      backgroundColor="background"
      width="100%"
      gap="s"
      position="absolute"
      zIndex="overlay"
      bottom={10}
      left={0}
    >
      <Card
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        gap="m"
        width="100%"
        paddingHorizontal="m"
        variant="hairlineTop"
      >
        {state.routes.map((route, idx) => (
          <TouchableOpacity
            key={route.key}
            alignItems="center"
            justifyContent="center"
            padding="m"
            hitSlop={20}
            gap="2"
            onPress={() => navigation.navigate(route.name)}
          >
            <Icon
              name={
                route.name === 'index'
                  ? 'Bookmark2'
                  : route.name === 'settings'
                    ? 'Setting4'
                    : route.name === 'reading'
                      ? 'Book1'
                      : 'Airdrop'
              }
              size="l"
              color={state.index === idx ? 'accent' : 'textFaint'}
              variant={state.index === idx ? 'Bold' : 'Outline'}
            />
            <Text variant="label">
              {route.name === 'index' ? 'library' : route.name}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          alignItems="center"
          justifyContent="center"
          padding="m"
          hitSlop={20}
          gap="2"
          onPress={() => router.navigate('/import')}
        >
          <Icon name="Add" size="l" variant="Outline" />
          <Text variant="label">import</Text>
        </TouchableOpacity>
      </Card>
    </Box>
  );
}
