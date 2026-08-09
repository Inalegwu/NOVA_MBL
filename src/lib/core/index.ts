import { Layer, ManagedRuntime } from 'effect';
import { ArchiveServiceLive } from './archive-service';
import { PageCacheServiceLive } from './cache-service';
import { PageDecodeServiceLive } from './page-decode-service';

const AppLayer = PageDecodeServiceLive.pipe(
  Layer.provideMerge(Layer.mergeAll(ArchiveServiceLive, PageCacheServiceLive)),
);

const runtime = ManagedRuntime.make(AppLayer);

export default runtime;
