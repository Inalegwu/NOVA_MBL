import { Box, Text } from '@atoms';
import { useLocalSearchParams } from 'expo-router';

export default function Page() {
  const { issueId } = useLocalSearchParams<{ issueId: string }>();

  return (
    <Box flex={1} backgroundColor="background">
      <Text>{issueId}</Text>
    </Box>
  );
}
