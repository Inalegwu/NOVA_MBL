import { Data } from 'effect';

export type ArchiveId = string;
export type PageIndex = number;
export type CacheTier = 'viewport' | 'full';

export type ArchiveManifest = {
  archiveId: ArchiveId;
  pageCount: number;
  pageFiles: ReadonlyArray<string>;
};

export class ArchiveReadError extends Data.TaggedError('ArchiveReadError')<{
  cause: unknown;
}> {}

export class DecodeError extends Data.TaggedError('DecodeError')<{
  cause: unknown;
}> {}

export const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;
