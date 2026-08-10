import { Box, Card, Text } from '@atoms';
import { Container } from '@components';

export default function Page() {
  return (
    <Container>
      <Card
        paddingHorizontal="s"
        width="100%"
        variant="hairlineBottom"
        height={100}
        flexDirection="column"
        alignItems="flex-start"
        justifyContent="space-between"
        paddingVertical="m"
      >
        <Box
          width="100%"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="flex-start"
            gap="2"
          >
            <Box width={10} height={10} backgroundColor="accent" />
            <Text variant="label" color="accent">
              lcl.st
            </Text>
          </Box>
        </Box>
        <Box
          width="100%"
          flexDirection="row"
          alignItems="flex-end"
          justifyContent="space-between"
        >
          <Text variant="titleLg">Settings</Text>
        </Box>
      </Card>
      <Card
        width="100%"
        variant="hairlineBottom"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="m"
        paddingVertical="m"
      >
        <Box alignItems="flex-start" justifyContent="center">
          <Text fontSize={14} variant="titleMd">
            Source Folder
          </Text>
          <Text variant="label">where to look for new issues</Text>
        </Box>
      </Card>
    </Container>
  );
}
