import { Context, Effect, Layer } from 'effect';
import type { UnknownException } from 'effect/Cause';
import * as FS from 'expo-file-system';
import type { ArchiveId, CacheTier, PageIndex } from './types';

type PageCacheServiceShape = {
  readonly get: (
    archiveId: ArchiveId,
    page: PageIndex,
    tier: CacheTier,
  ) => Effect.Effect<Uint8Array<ArrayBuffer> | undefined, UnknownException>;
  readonly put: (
    archiveId: ArchiveId,
    page: PageIndex,
    tier: CacheTier,
    bytes: Uint8Array,
  ) => Effect.Effect<void>;
  readonly evictAround: (
    archiveId: ArchiveId,
    centerPage: PageIndex,
    keepRadius: number,
  ) => Effect.Effect<void>;
};

export class PageCacheService extends Context.Tag('PageCacheService')<
  PageCacheService,
  PageCacheServiceShape
>() {}

const cacheRoot = new FS.Directory(FS.Paths.cache, 'comic-page-cache');

function tierFile(
  archiveId: ArchiveId,
  page: PageIndex,
  tier: CacheTier,
): FS.File {
  return new FS.File(cacheRoot, archiveId, tier, `${page}.bin`);
}

export const PageCacheServiceLive = Layer.succeed(PageCacheService, {
  get: (archiveId, page, tier) =>
    Effect.tryPromise(async () => {
      const f = tierFile(archiveId, page, tier);
      if (!f.exists) return undefined;
      return await new Uint8Array(await f.bytes());
    }),
  put: (archiveId, page, tier, bytes) =>
    Effect.sync(() => {
      const f = tierFile(archiveId, page, tier);
      if (!f.parentDirectory.exists) {
        f.parentDirectory.create({ intermediates: true });
      }
      f.write(bytes);
    }),
  evictAround: (archiveId, centerPage, keepRadius) =>
    Effect.sync(() => {
      for (const tier of ['viewport', 'full'] as const) {
        const dir = new FS.Directory(cacheRoot, archiveId, tier);
        if (!dir.exists) continue;
        for (const entry of dir.list()) {
          if (!(entry instanceof FS.File)) continue;
          const page = +entry.name.replace('.bin', '');
          if (Math.abs(page - centerPage) > keepRadius) entry.delete();
        }
      }
    }),
});
