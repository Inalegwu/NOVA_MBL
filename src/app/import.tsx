import { Box, Card, Icon, Text } from '@atoms';
import { TouchableOpacity } from '@components';
import { Effect } from 'effect';
import * as DocumentPicker from 'expo-document-picker';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { ArchiveService } from '@/lib/core/archive-service';
import runtime from '@/lib/core/index';
import db from '@/lib/db';
import { issues } from '@/lib/db/schema';
import { formatBytes, parseFilename, SUPPORTED_EXT } from '@/lib/utils';

export default function Page() {
  const [items, setItems] = useState<ReadonlyArray<StagedItem>>([]);

  const pickFiles = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: false,
      type: ['application/vnd.comicbook+zip', 'application/zip', '*/*'],
    });

    if (result.canceled) return;

    const staged = result.assets
      .filter((a) => SUPPORTED_EXT.test(a.name))
      .map((a): StagedItem => {
        const { series, title } = parseFilename(a.name);

        return {
          uri: a.uri,
          filename: a.name,
          sizeBytes: a.size ?? 0,
          selected: true,
          status: 'queued',
          progress: 0,
          series,
          title,
        };
      });
    setItems(staged);
  }, []);

  const toggleSelected = useCallback((uri: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.uri === uri ? { ...it, selected: !it.selected } : it,
      ),
    );
  }, []);

  const updateItem = useCallback((uri: string, patch: Partial<StagedItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.uri === uri ? { ...it, ...patch } : it)),
    );
  }, []);

  const importSelected = useCallback(async () => {
    const toImport = items.filter((it) => it.selected && it.status !== 'done');

    // sequential on purpose — extraction is disk/CPU heavy, running several
    // native unzips concurrently just contends for the same resources
    for (const item of toImport) {
      updateItem(item.uri, { status: 'extracting', progress: 0 });

      const manifest = await runtime.runPromise(
        ArchiveService.pipe(
          Effect.flatMap((svc) =>
            svc.index(item.uri, (fraction) =>
              updateItem(item.uri, { progress: fraction }),
            ),
          ),
          Effect.catchAll((error) =>
            Effect.sync(() => {
              console.log({ error: error.message, cause: error.cause });
              updateItem(item.uri, { status: 'error' });
              return null;
            }),
          ),
        ),
      );

      if (!manifest) continue;

      await db.insert(issues).values({
        id: manifest.archiveId,
        filePath: item.uri,
        series: item.series,
        title: item.title,
        pageCount: manifest.pageCount,
        sizeBytes: item.sizeBytes,
        addedAt: Date.now(),
      });

      updateItem(item.uri, { status: 'done', progress: 1 });
    }
  }, [items, updateItem]);

  const selectedItems = items.filter((it) => it.selected);
  const totalBytes = selectedItems.reduce((sum, it) => sum + it.sizeBytes, 0);

  return (
    <Box backgroundColor="background" flex={1}>
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
            Add To Library
          </Text>
        </Box>
        <Box
          width="100%"
          flexDirection="row"
          alignItems="flex-end"
          justifyContent="space-between"
        >
          <Text variant="titleLg">Import</Text>
        </Box>
      </Card>
      <Card
        variant="hairlineBottom"
        flexDirection="row"
        justifyContent="space-between"
        paddingHorizontal="m"
        paddingVertical="m"
      >
        <Box alignItems="flex-start" justifyContent="center">
          <Text variant="label">Source</Text>
          <Text variant="monoSm">
            {items.length > 0
              ? `${items.length} files selected`
              : 'Tap to choose files'}
          </Text>
        </Box>
        <TouchableOpacity
          borderColor="border"
          borderWidth={StyleSheet.hairlineWidth}
          alignItems="center"
          justifyContent="center"
          paddingHorizontal="l"
          paddingVertical="s"
          activeOpacity={0.7}
          onPress={pickFiles}
        >
          <Text variant="label">{items.length > 0 ? 'Change' : 'Select'}</Text>
        </TouchableOpacity>
      </Card>
      <FlatList
        data={items}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <Card
            width="100%"
            variant="hairlineBottom"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            paddingHorizontal="m"
            paddingVertical="m"
          >
            <TouchableOpacity
              backgroundColor={item.selected ? 'transparent' : 'accent'}
              width={20}
              hitSlop={20}
              alignItems="center"
              justifyContent="center"
              height={20}
              onPress={() => toggleSelected(item.uri)}
            >
              {item.selected ? <Icon name="TickSquare" /> : null}
            </TouchableOpacity>
            <Box
              width="80%"
              gap="2"
              alignItems="flex-start"
              justifyContent="center"
            >
              <Box>
                <Text
                  color="text"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  fontSize={14}
                  variant="titleMd"
                >
                  {item.series} - {item.title}
                </Text>
                <Text variant="label" numberOfLines={1}>
                  {item.filename}
                </Text>
              </Box>
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="flex-start"
                gap="1"
              >
                <Card
                  paddingHorizontal="s"
                  paddingVertical="1"
                  variant="hairlineAll"
                >
                  <Text variant="label" fontSize={8}>
                    {item.status}
                  </Text>
                </Card>
                <Box width="70%" backgroundColor="textFaint">
                  <Box
                    backgroundColor="accent"
                    height={StyleSheet.hairlineWidth + 2}
                    width={`${item.progress * 100}%`}
                  />
                </Box>
              </Box>
            </Box>
            <Box alignItems="flex-end" justifyContent="center">
              <Text variant="label">{formatBytes(item.sizeBytes)}</Text>
            </Box>
          </Card>
        )}
      />
      <Card
        width="100%"
        variant="hairlineTop"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingVertical="l"
        paddingHorizontal="m"
      >
        <Box alignItems="flex-start" justifyContent="center">
          <Text variant="titleMd">{selectedItems.length} Selected</Text>
          <Text variant="label">{formatBytes(totalBytes)} .</Text>
        </Box>
        <TouchableOpacity
          paddingHorizontal="l"
          paddingVertical="2"
          backgroundColor="accent"
          onPress={importSelected}
        >
          <Text fontSize={12} color="background" variant="label">
            import
          </Text>
        </TouchableOpacity>
      </Card>
    </Box>
  );
}
