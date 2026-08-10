import { Box, Text } from '@atoms';
import { Container } from '@components';
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

function useReaderPage(manifest: ArchiveManifest, initialPage: number) {
  const [page, setPageRaw] = useState(initialPage);
  const [image, setImage] = useState<SkImage | null>(null);

  useEffect(() => {
    let cancelled = false;

    runtime
      .runPromise(
        PageDecodeService.pipe(
          Effect.flatMap((svc) => svc.getPage(manifest, page, 'viewport')),
        ),
      )
      .then((img) => {
        if (!cancelled) setImage(img);
      })
      .catch(() => {
        if (!cancelled) setImage(null);
      });

    const neighbors = [page - 1, page + 1].filter(
      (p) => p >= 0 && p < manifest.pageCount,
    );

    runtime.runPromise(
      PageDecodeService.pipe(
        Effect.flatMap((svc) => svc.prefetch(manifest, neighbors)),
      ),
    );

    upsertProgress(manifest.archiveId, page);

    return () => {
      cancelled = true;
    };
  }, [manifest, page]);

  const setPage = useCallback(
    (next: number) => setPageRaw(() => clamp(next, 0, manifest.pageCount - 1)),
    [manifest.pageCount],
  );

  return { page, image, setPage };
}

export default function Page() {
  const { issueId } = useLocalSearchParams<{ issueId: string }>();

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
    <ReaderView
      manifest={data?.manifest}
      initialPage={data?.startPage}
      onClose={() => router.back()}
    />
  );
}

type ReaderViewProps = {
  manifest: ArchiveManifest;
  initialPage: number;
  onClose: () => void;
};

function ReaderView({ manifest, initialPage }: ReaderViewProps) {
  const { width: cw, height: ch } = useWindowDimensions();
  const { page, image, setPage } = useReaderPage(manifest, initialPage);

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const pageDragX = useSharedValue(0);

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
      if (pageDragX.value < -threshold || e.velocityX < -800) {
        runOnJS(goToPage)(1);
      } else if (pageDragX.value > threshold || e.velocityX > 800) {
        runOnJS(goToPage)(-1);
      }
      pageDragX.value = withTiming(0);
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

  const gestureTransform = useDerivedValue(() => [
    { translateX: translateX.value },
    { translateY: translateY.value },
    { scale: scale.value },
  ]);

  const fitTransform = useMemo(() => {
    if (!image) return undefined;
    const src = rect(0, 0, image.width(), image.height());
    const dst = rect(0, 0, cw, ch);
    return fitbox('contain', src, dst);
  }, [image, cw, ch]);

  return (
    <Box>
      <GestureDetector gesture={composedGesture}>
        <Canvas style={{ width: cw, height: ch }}>
          {image && fitTransform && (
            <Group transform={fitTransform}>
              <Group transform={gestureTransform}>
                <SkiaImage
                  image={image}
                  x={0}
                  y={0}
                  width={image.width()}
                  height={image.height()}
                />
              </Group>
            </Group>
          )}
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
