import { Box, Card, Icon } from '@atoms';
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
      height={130}
      gap="m"
    >
      <Card
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        gap="m"
        paddingHorizontal="m"
        variant="hairlineAll"
        borderRadius="full"
      >
        {state.routes.map((route, idx) => (
          <TouchableOpacity
            key={route.key}
            alignItems="center"
            justifyContent="center"
            padding="m"
            hitSlop={20}
            onPress={() => navigation.navigate(route.name)}
          >
            <Icon
              name={
                route.name === 'index'
                  ? 'BookSquare'
                  : route.name === 'settings'
                    ? 'Setting4'
                    : 'Airdrop'
              }
              size="xl"
              variant={state.index === idx ? 'Bold' : 'Outline'}
            />
          </TouchableOpacity>
        ))}
      </Card>
      <Card variant="hairlineAll" borderRadius="full">
        <TouchableOpacity
          alignItems="center"
          justifyContent="center"
          padding="m"
          hitSlop={20}
          backgroundColor="accent"
          borderRadius="full"
          onPress={() => router.navigate('/import')}
        >
          <Icon name="Add" color="textAlt" size="xl" variant="Outline" />
        </TouchableOpacity>
      </Card>
    </Box>
  );
}
