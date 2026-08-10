import { Context, Effect, Layer } from 'effect';
import * as Crypto from 'expo-crypto';
import * as FS from 'expo-file-system';
import { subscribe, unzip } from 'react-native-zip-archive';
import { naturalCompare, toFsPath } from '../utils';
import { type ArchiveManifest, ArchiveReadError, IMAGE_EXT } from './types';

function listFilesRecursive(dir: FS.Directory): FS.File[] {
  const files: FS.File[] = [];
  for (const entry of dir.list()) {
    if (entry instanceof FS.File) {
      files.push(entry);
    } else if (entry instanceof FS.Directory) {
      files.push(...listFilesRecursive(entry));
    }
  }
  return files;
}

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
  index: (filePath, onProgress) =>
    Effect.gen(function* () {
      const sourcePath = toFsPath(filePath);
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

      yield* Effect.logInfo({
        filePath,
        alreadyExtracted,
      });

      if (!alreadyExtracted) {
        yield* Effect.tryPromise({
          try: async () => {
            dest.create({ intermediates: true });
            await unzipWithProgress(sourcePath, dest.uri, onProgress);
          },
          catch: (cause) => new ArchiveReadError({ cause }),
        });
      }

      const pageFiles = yield* Effect.try({
        try: () =>
          listFilesRecursive(dest)
            .filter((f) => IMAGE_EXT.test(f.name))
            .map((f) => f.uri)
            .sort(naturalCompare),
        catch: (cause) => new ArchiveReadError({ cause }),
      });

      return {
        archiveId,
        pageCount: pageFiles.length,
        pageFiles,
      } satisfies ArchiveManifest;
    }),
});

function unzipWithProgress(
  source: string,
  target: string,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  const sourcePath = toFsPath(source);
  const targetPath = toFsPath(target);

  return new Promise((resolve, reject) => {
    const sub = onProgress
      ? subscribe(({ progress, filePath }) => {
          if (filePath === target) onProgress(progress);
        })
      : undefined;

    unzip(sourcePath, targetPath)
      .then((path) => {
        sub?.remove();
        resolve(path);
      })
      .catch((err) => {
        console.error(err);
        sub?.remove();
        reject(err);
      });
  });
}
