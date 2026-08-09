import { Context, Effect, Layer } from 'effect';
import * as Crypto from 'expo-crypto';
import * as FS from 'expo-file-system';
import { subscribe, unzip } from 'react-native-zip-archive';
import { naturalCompare } from '../utils';
import { type ArchiveManifest, ArchiveReadError, IMAGE_EXT } from './types';

type ArchiveServiceShape = Readonly<{
  index: (
    filePath: string,
    onProgress?: (fraction: number) => void,
  ) => Effect.Effect<ArchiveManifest, ArchiveReadError>;
}>;

export class ArchiveService extends Context.Tag('ArchiveService')<
  ArchiveService,
  ArchiveServiceShape
>() {}

const extractRoot = new FS.Directory(FS.Paths.cache, 'nova_cache');

export const ArchiveServiceLive = Layer.succeed(ArchiveService, {
  index: (filePath) =>
    Effect.gen(function* () {
      const archiveId = yield* Effect.tryPromise({
        try: async () =>
          await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            filePath,
          ),
        catch: (cause) => new ArchiveReadError({ cause }),
      });

      const dest = new FS.Directory(extractRoot, archiveId);

      const alreadyExtracted = yield* Effect.sync(() => dest.exists);

      yield* Effect.logInfo({ alreadyExtracted });

      if (!alreadyExtracted) {
        yield* Effect.tryPromise({
          try: async () => {
            dest.create({ intermediates: true });
            await unzipWithProgress(filePath, dest.uri);
          },
          catch: (cause) => new ArchiveReadError({ cause }),
        });
      }

      const pageFiles = yield* Effect.try({
        try: () =>
          dest
            .list()
            .filter(
              (entry): entry is FS.File =>
                entry instanceof File && IMAGE_EXT.test(entry.name),
            )
            .map((f) => f.uri)
            .sort(naturalCompare),
        catch: (cause) => new ArchiveReadError({ cause }),
      });

      return {
        archiveId,
        pageCount: 0,
        pageFiles,
      } satisfies ArchiveManifest;
    }),
});

function unzipWithProgress(
  source: string,
  target: string,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const sub = onProgress
      ? subscribe(({ progress, filePath }) => {
          if (filePath === target) onProgress(progress);
        })
      : undefined;

    console.log(sub);

    unzip(source, target)
      .then((path) => {
        sub?.remove();
        resolve(path);
      })
      .catch((err) => {
        sub?.remove();
        reject(err);
      });
  });
}
