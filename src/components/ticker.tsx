import { Box } from '@atoms';
import { useTheme } from '@shopify/restyle';
import { useCallback, useEffect, useMemo } from 'react';
import { type LayoutChangeEvent, StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { Theme } from '@/lib/theme';

type TickerProps = {
  /** 0–100. Values outside this range are clamped. */
  progress: number;
  tickCount?: number;
  majorEvery?: number;
  height?: number;
};

const THUMB_WIDTH = StyleSheet.hairlineWidth * 4;

export function Ticker({
  progress,
  tickCount = 40,
  majorEvery = 5,
  height = 16,
}: TickerProps) {
  const theme = useTheme<Theme>();
  const clamped = Math.min(100, Math.max(0, progress));

  const animatedProgress = useSharedValue(clamped);
  const trackWidth = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(clamped, { duration: 280 });
  }, [clamped, animatedProgress]);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      trackWidth.value = e.nativeEvent.layout.width;
    },
    [trackWidth],
  );

  const thumbStyle = useAnimatedStyle(() => {
    const left = interpolate(
      animatedProgress.value,
      [0, 100],
      [0, Math.max(trackWidth.value - THUMB_WIDTH, 0)],
      Extrapolation.CLAMP,
    );
    return { transform: [{ translateX: left }] };
  });

  const ticks = useMemo(
    () => Array.from({ length: tickCount }, (_, i) => i),
    [tickCount],
  );

  return (
    <Box
      flexDirection="row"
      alignItems="flex-end"
      position="relative"
      onLayout={onLayout}
      style={{
        height,
      }}
    >
      {ticks.map((i) => (
        <Tick
          key={i}
          index={i}
          tickCount={tickCount}
          isMajor={i % majorEvery === 0}
          height={height}
          animatedProgress={animatedProgress}
          colors={theme.colors}
        />
      ))}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            bottom: 0,
            width: THUMB_WIDTH,
            height,
            backgroundColor: theme.colors.accent,
          },
          thumbStyle,
        ]}
      />
    </Box>
  );
}

type TickProps = {
  index: number;
  tickCount: number;
  isMajor: boolean;
  height: number;
  animatedProgress: SharedValue<number>;
  colors: Theme['colors'];
};

function Tick({
  index,
  tickCount,
  isMajor,
  height,
  animatedProgress,
  colors,
}: TickProps) {
  const thresholdPercent = (index / Math.max(tickCount - 1, 1)) * 100;
  const idleColor = isMajor ? colors.accent : colors.border;

  const style = useAnimatedStyle(() => {
    // crossfades color right at the moment the sweep passes this tick,
    // rather than snapping — reads as a smooth fill even though each
    // tick is a discrete element
    const backgroundColor = interpolateColor(
      animatedProgress.value,
      [thresholdPercent - 2, thresholdPercent],
      [idleColor, colors.accent],
    );
    return { backgroundColor };
  });

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          marginHorizontal: 1,
          height: isMajor ? height * 1 : height * 0.4,
        },
        style,
      ]}
    />
  );
}
