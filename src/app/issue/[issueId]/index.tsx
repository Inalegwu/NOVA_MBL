import { Box, Card, Icon, Text } from '@atoms';
import { Container, Ticker, TouchableOpacity } from '@components';
import {
  Canvas,
  fitbox,
  Group,
  rect,
  type SkImage,
  Image as SkiaImage,
} from '@shopify/react-native-skia';
import { Effect } from 'effect';
import { router, useLocalSearchParams } from 'expo-router';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';
import { app } from 'src/api/app';
import runtime from '@/lib/core';
import { PageDecodeService } from '@/lib/core/page-decode-service';
import type { ArchiveManifest } from '@/lib/core/types';
import { upsertProgress } from '@/lib/db';

const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;

function clamp(value: number, min: number, max: number): number {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

const WINDOW_RADIUS = 2;

function useReaderPageWindow(manifest: ArchiveManifest, initialPage: number) {
  const [page, setPageRaw] = useState(initialPage);
  const [images, setImages] = useState<Record<number, SkImage>>({});

  useEffect(() => {
    let cancelled = false;

    const wanted: number[] = [];
    for (let d = -WINDOW_RADIUS; d <= WINDOW_RADIUS; d++) {
      const p = page + d;
      if (p >= 0 && p < manifest.pageCount) wanted.push(p);
    }

    const decode = (p: number) =>
      runtime
        .runPromise(
          PageDecodeService.pipe(
            Effect.flatMap((svc) => svc.getPage(manifest, p, 'viewport')),
          ),
        )
        .then((img) => {
          if (cancelled) return;
          setImages((prev) => (prev[p] ? prev : { ...prev, [p]: img }));
        })
        .catch(() => {
          // leave it out of the window — the render below just skips a
          // missing slot rather than crashing on it
        });

    // current page decodes first and alone; neighbors follow in parallel
    // once it's in, so the visible page never waits behind prefetch work
    (async () => {
      if (!images[page]) await decode(page);
      if (cancelled) return;
      await Promise.all(wanted.filter((p) => p !== page).map(decode));
    })();

    // evict anything that's fallen outside the window — release native
    // texture memory rather than letting it ride along indefinitely
    setImages((prev) => {
      const wantedSet = new Set(wanted);
      let changed = false;
      const next: Record<number, SkImage> = {};
      for (const [key, img] of Object.entries(prev)) {
        const p = Number(key);
        if (wantedSet.has(p)) {
          next[p] = img;
        } else {
          img.dispose?.();
          changed = true;
        }
      }
      return changed ? next : prev;
    });

    upsertProgress(manifest.archiveId, page);

    return () => {
      cancelled = true;
    };
    // intentionally omitting `images` — this effect should only re-run on
    // page/manifest change; it reads the current `images` snapshot once to
    // skip redundant decodes, not to react to every window update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifest, page, images]);

  const setPage = useCallback(
    (next: number) => setPageRaw(() => clamp(next, 0, manifest.pageCount - 1)),
    [manifest.pageCount],
  );

  return { page, images, setPage };
}

export default function Page() {
  const { issueId } = useLocalSearchParams<{ issueId: string }>();
  const [page, setPage] = useState(0);

  const { data, isLoading } = app.issues.getIssueById.useQuery({
    variables: {
      issueId,
    },
  });

  if (isLoading) {
    return (
      <Container alignItems="center" justifyContent="center">
        <Text variant="label">Getting pages...</Text>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container>
        <Text variant="label">Error getting page data</Text>
      </Container>
    );
  }

  return (
    <>
      <Box
        position="absolute"
        flex={1}
        paddingVertical="xxxl"
        paddingHorizontal="s"
        backgroundColor="transparent"
        zIndex="overlay"
        top={0}
        left={0}
        width="100%"
        height="100%"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box
          width="100%"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Card variant="hairlineAll" p="2">
            <TouchableOpacity onPress={() => router.back()} hitSlop={20}>
              <Icon name="ArrowLeft2" size="m" />
            </TouchableOpacity>
          </Card>
          <Box alignItems="flex-end" justifyContent="center">
            <Text variant="label" color="accent">
              {data.issue.series}
            </Text>
            <Text variant="titleMd" color="textMuted" fontSize={14}>
              {data.issue.title}
            </Text>
          </Box>
        </Box>
        <Box width="100%" gap="5">
          <Box
            width="100%"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              gap="0.5"
            >
              <Text fontSize={10} variant="label" color="accent">
                {page + 1}
              </Text>
              <Text variant="label" fontSize={10}>
                /
              </Text>
              <Text variant="label" fontSize={10}>
                {data.issue.pageCount ?? 0}
              </Text>
            </Box>
            <Text variant="label">
              {Math.round((page / data.issue.pageCount) * 100)}%
            </Text>
          </Box>
          <Box
            width="100%"
            flexDirection="row"
            alignItems="center"
            justifyContent="flex-start"
          >
            <Box width="80%">
              <Ticker
                progress={Math.round((page / data.issue.pageCount) * 100)}
              />
            </Box>
          </Box>
        </Box>
      </Box>
      <ReaderView
        manifest={data?.manifest}
        initialPage={data?.startPage}
        onClose={() => router.back()}
        setPage={setPage}
      />
    </>
  );
}

type ReaderViewProps = {
  manifest: ArchiveManifest;
  initialPage: number;
  onClose: () => void;
  setPage: React.Dispatch<React.SetStateAction<number>>;
};

function ReaderView({
  manifest,
  initialPage,
  setPage: updatePage,
}: ReaderViewProps) {
  const { width: cw, height: ch } = useWindowDimensions();
  const { page, images, setPage } = useReaderPageWindow(manifest, initialPage);

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const pageDragX = useSharedValue(0);

  useEffect(() => {
    updatePage(page);
  }, [page, updatePage]);

  const resetZoom = useCallback(() => {
    scale.value = withTiming(1);
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
  }, [scale, translateX, translateY]);

  const goToPage = useCallback(
    (delta: number) => {
      setPage(page + delta);
    },
    [page, setPage],
  );

  const pinch = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = clamp(savedScale.value * e.scale, 1, MAX_SCALE);
    })
    .onEnd(() => {
      if (scale.value < 1.05) runOnJS(resetZoom)();
    });

  const pan = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      } else {
        pageDragX.value = e.translationX;
      }
    })
    .onEnd((e) => {
      if (scale.value > 1) return;

      const threshold = cw * 0.22;
      const goingNext = pageDragX.value < -threshold || e.velocityX < -800;
      const goingPrev = pageDragX.value > threshold || e.velocityX > 800;

      if (goingNext || goingPrev) {
        // the neighbor is already decoded and sitting one canvas-width
        // away in the filmstrip — just finish sliding the whole strip
        // over, then recenter on the new page once it's off-screen
        const exitX = goingNext ? -cw : cw;
        pageDragX.value = withTiming(exitX, { duration: 180 }, (finished) => {
          if (finished) {
            pageDragX.value = 0;
            runOnJS(goToPage)(goingNext ? 1 : -1);
          }
        });
      } else {
        pageDragX.value = withTiming(0);
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        runOnJS(resetZoom)();
      } else {
        scale.value = withTiming(DOUBLE_TAP_SCALE);
      }
    });

  const composedGesture = Gesture.Race(
    doubleTap,
    Gesture.Simultaneous(pinch, pan),
  );

  // slides the whole filmstrip during a swipe/exit — zoom (scale/pan)
  // below applies only to the current slot, since you can only zoom the
  // page you're looking at
  const filmstripTransform = useDerivedValue(() => [
    { translateX: pageDragX.value },
  ]);
  const zoomTransform = useDerivedValue(() => [
    { translateX: translateX.value },
    { translateY: translateY.value },
    { scale: scale.value },
  ]);

  const slots = useMemo(() => {
    const result: Array<{ index: number; image: SkImage }> = [];
    for (let d = -WINDOW_RADIUS; d <= WINDOW_RADIUS; d++) {
      const p = page + d;
      const img = images[p];
      if (img) result.push({ index: p, image: img });
    }
    return result;
  }, [page, images]);

  return (
    <Box backgroundColor="background">
      <GestureDetector gesture={composedGesture}>
        <Canvas style={{ width: cw, height: ch }}>
          <Group transform={filmstripTransform}>
            {slots.map(({ index, image }) => {
              const src = rect(0, 0, image.width(), image.height());
              const dst = rect(0, 0, cw, ch);
              const fitTransform = fitbox('contain', src, dst);
              const slotX = (index - page) * cw;
              const isCurrent = index === page;

              return (
                <Group key={index} transform={[{ translateX: slotX }]}>
                  <Group transform={fitTransform}>
                    <Group transform={isCurrent ? zoomTransform : undefined}>
                      <SkiaImage
                        image={image}
                        x={0}
                        y={0}
                        width={image.width()}
                        height={image.height()}
                      />
                    </Group>
                  </Group>
                </Group>
              );
            })}
          </Group>
        </Canvas>
      </GestureDetector>

      <Box pointerEvents="none">
        <Text variant="label">
          {String(page + 1).padStart(3, '0')} /{' '}
          {String(manifest.pageCount).padStart(3, '0')}
        </Text>
      </Box>
    </Box>
  );
}
