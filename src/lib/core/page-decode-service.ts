import { type SkImage, Skia } from '@shopify/react-native-skia';
import { Context, Effect, Layer } from 'effect';
import type { UnknownException } from 'effect/Cause';
import { File } from 'expo-file-system';
import { PageCacheService } from './cache-service';
import {
  type ArchiveManifest,
  ArchiveReadError,
  type CacheTier,
  DecodeError,
  type PageIndex,
} from './types';

type PageDecodeServiceShape = {
  readonly getPage: (
    manifest: ArchiveManifest,
    page: PageIndex,
    tier: CacheTier,
  ) => Effect.Effect<
    SkImage,
    UnknownException | ArchiveReadError | DecodeError
  >;
  readonly prefetch: (
    manifest: ArchiveManifest,
    pages: ReadonlyArray<PageIndex>,
  ) => Effect.Effect<void>;
};

class PageDecodeService extends Context.Tag('PageDecodeService')<
  PageDecodeService,
  PageDecodeServiceShape
>() {}

const VIEWPORT_MAX_DIM = 1400; // tune to device screen density

function resizeAndEncode(original: SkImage, maxDim: number): Uint8Array {
  const scale = Math.min(
    1,
    maxDim / Math.max(original.width(), original.height()),
  );
  const w = Math.round(original.width() * scale);
  const h = Math.round(original.height() * scale);

  const surface = Skia.Surface.MakeOffscreen(w, h);
  if (!surface) throw new Error('failed to allocate offscreen surface');

  const canvas = surface.getCanvas();
  canvas.drawImageRect(
    original,
    Skia.XYWHRect(0, 0, original.width(), original.height()),
    Skia.XYWHRect(0, 0, w, h),
    Skia.Paint(),
  );
  surface.flush();

  const snapshot = surface.makeImageSnapshot();
  const encoded = snapshot.encodeToBytes(); // defaults to PNG; pass format/quality for JPEG
  return new Uint8Array(encoded);
}

export const PageDecodeServiceLive = Layer.effect(
  PageDecodeService,
  Effect.gen(function* () {
    const cache = yield* PageCacheService;

    const decodeBytes = (bytes: Uint8Array) =>
      Effect.try({
        try: () => {
          const data = Skia.Data.fromBytes(bytes);
          const image = Skia.Image.MakeImageFromEncoded(data);
          if (!image) throw new Error('skia failed to decode image');
          return image;
        },
        catch: (cause) => new DecodeError({ cause }),
      });

    const getPage: PageDecodeServiceShape['getPage'] = (manifest, page, tier) =>
      Effect.gen(function* () {
        const cached = yield* cache.get(manifest.archiveId, page, tier);
        if (cached) return yield* decodeBytes(cached);

        const originalPath = manifest.pageFiles[page];
        if (!originalPath) {
          return yield* Effect.fail(
            new ArchiveReadError({ cause: `no page at index ${page}` }),
          );
        }

        const originalBytes = yield* Effect.tryPromise({
          try: async () => new Uint8Array(await new File(originalPath).bytes()),
          catch: (cause) => new ArchiveReadError({ cause }),
        });

        const originalImage = yield* decodeBytes(originalBytes);

        if (tier === 'full') {
          yield* cache.put(manifest.archiveId, page, tier, originalBytes);
          return originalImage;
        }

        const resized = yield* Effect.try({
          try: () => resizeAndEncode(originalImage, VIEWPORT_MAX_DIM),
          catch: (cause) => new DecodeError({ cause }),
        });
        yield* cache.put(manifest.archiveId, page, tier, resized);
        return yield* decodeBytes(resized);
      });

    const prefetch: PageDecodeServiceShape['prefetch'] = (manifest, pages) =>
      Effect.forEach(pages, (p) => getPage(manifest, p, 'viewport'), {
        concurrency: 2,
        discard: true,
      }).pipe(Effect.ignore);

    return { getPage, prefetch };
  }),
);
