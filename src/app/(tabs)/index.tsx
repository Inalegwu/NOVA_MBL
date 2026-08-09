import { Box, Card, Text } from '@atoms';
import { Container, TouchableOpacity } from '@components';
import { router } from 'expo-router';

export default function Page() {
  return (
    <Container>
      {/* overview */}
      <Card
        paddingHorizontal="s"
        width="100%"
        variant="hairlineBottom"
        height={90}
        flexDirection="column"
        alignItems="flex-start"
        justifyContent="space-between"
        paddingVertical="m"
      >
        <Box
          width="100%"
          flexDirection="row"
          alignItems="center"
          justifyContent="flex-start"
          gap="2"
        >
          <Box width={10} height={10} backgroundColor="accent" />
          <Text variant="label" color="accent">
            Local Library
          </Text>
        </Box>
        <Box
          width="100%"
          flexDirection="row"
          alignItems="flex-end"
          justifyContent="space-between"
        >
          <Text variant="titleLg">Issues</Text>
          <Text variant="label">24/1.8gb</Text>
        </Box>
      </Card>
      <Box width="100%" flex={1}>
        <Card
          width="100%"
          variant="hairlineBottom"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="m"
          paddingVertical="m"
        >
          <Box
            width={80}
            height={120}
            borderRadius="sm"
            backgroundColor="textFaint"
            alignItems="center"
            justifyContent="center"
            gap="3"
          >
            <Text variant="label">AB</Text>
          </Box>
          <Box
            flexDirection="column"
            alignItems="flex-start"
            justifyContent="center"
            flex={1}
            paddingHorizontal="s"
          >
            <Text>content</Text>
          </Box>
          <Box
            flexDirection="column"
            alignItems="flex-end"
            justifyContent="center"
            gap="0.5"
          >
            <Text variant="monoSm">18/32</Text>
            <Text variant="label">210mb</Text>
          </Box>
        </Card>
      </Box>
      <TouchableOpacity onPress={() => router.navigate('/import')}>
        <Text>import</Text>
      </TouchableOpacity>
    </Container>
  );
}
