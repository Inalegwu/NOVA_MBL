import { Box, Card, Text } from '@atoms';
import { Container, TouchableOpacity } from '@components';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import db from '@/lib/db';
import { formatBytes } from '@/lib/utils';

export default function Page() {
  const [issues, setIssues] = useState<ReadonlyArray<Issue>>([]);

  useEffect(() => {
    (async () => {
      const issues = await db.query.issues.findMany({});
      setIssues(issues);
    })();
  }, []);

  return (
    <Container>
      {/* overview */}
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
              Local Library
            </Text>
          </Box>
          <TouchableOpacity
            hitSlop={20}
            paddingHorizontal="m"
            paddingVertical="1"
            backgroundColor="accent"
            onPress={() => router.navigate('/import')}
          >
            <Text variant="label" color="background">
              import
            </Text>
          </TouchableOpacity>
        </Box>
        <Box
          width="100%"
          flexDirection="row"
          alignItems="flex-end"
          justifyContent="space-between"
        >
          <Text variant="titleLg">Issues</Text>
          <Text variant="label">240mb/1.8gb</Text>
        </Box>
      </Card>
      <FlatList
        data={issues}
        keyExtractor={(item) => item.id}
        renderItem={({ item: issue }) => <IssueRow issue={issue} />}
      />
    </Container>
  );
}

const IssueRow = ({ issue }: { issue: Issue }) => {
  return (
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
        width={60}
        height={70}
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
        height="100%"
      >
        <Text variant="monoSm">{issue.title}</Text>
      </Box>
      <Box
        flexDirection="column"
        alignItems="flex-end"
        justifyContent="center"
        gap="0.5"
      >
        <Text variant="monoSm">{issue.pageCount}</Text>
        <Text variant="label">{formatBytes(issue.sizeBytes)}</Text>
      </Box>
    </Card>
  );
};
