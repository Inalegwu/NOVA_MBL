import { Box, Card, Text } from '@atoms';
import { Container, TouchableOpacity } from '@components';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { app } from 'src/api/app';
import { formatBytes } from '@/lib/utils';

export default function Page() {
  // const qc = useQueryClient();
  const { data, isLoading } = app.issues.getIssues.useQuery();

  // useEffect(() => {
  //   qc.invalidateQueries({
  //     queryKey: ['issues'],
  //   });
  //   (async () => {
  //     await db.delete(issues);
  //     qc.invalidateQueries({
  //       queryKey: ['issues'],
  //     });
  //   })();
  // }, [qc]);

  if (isLoading) {
    return (
      <Container>
        <ActivityIndicator size="large" />
      </Container>
    );
  }

  const totalSize = data?.reduce((acc, curr) => acc + curr.sizeBytes, 0) ?? 0;

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
              lcl.lib
            </Text>
          </Box>
        </Box>
        <Box
          width="100%"
          flexDirection="row"
          alignItems="flex-end"
          justifyContent="space-between"
        >
          <Text variant="titleLg">Library</Text>
          <Text variant="label">{formatBytes(totalSize)}</Text>
        </Box>
      </Card>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item: issue }) => <IssueRow issue={issue} />}
      />
    </Container>
  );
}

const IssueRow = ({
  issue,
}: {
  issue: Issue & {
    progress: ReadingProgress | null;
  };
}) => {
  return (
    <Card width="100%" variant="hairlineBottom">
      <TouchableOpacity
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="m"
        paddingVertical="m"
        onPress={() => router.navigate(`/issue/${issue.id}`)}
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
          alignItems="flex-start"
          justifyContent="center"
          flex={1}
          paddingHorizontal="s"
          height="100%"
          gap="2"
        >
          <Box alignItems="flex-start" justifyContent="center">
            <Text variant="label">{issue.series}</Text>
            <Text
              variant="titleMd"
              fontSize={15}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Issue {issue.title}
            </Text>
          </Box>
          <Box backgroundColor="accentMuted" borderRadius="full" width="100%">
            <Box
              height={StyleSheet.hairlineWidth + 2}
              borderRadius="full"
              width={`${(issue.progress?.currentPage! / issue.pageCount) * 100}%`}
              backgroundColor="accent"
            />
          </Box>
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
      </TouchableOpacity>
    </Card>
  );
};
