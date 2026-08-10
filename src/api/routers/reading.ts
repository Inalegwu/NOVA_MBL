import { eq } from 'drizzle-orm';
import { router } from 'react-query-kit';
import db from '@/lib/db';
import { issues, readingProgress } from '@/lib/db/schema';

export const readingRouter = router('reading', {
  getCurrentlyReading: router.query({
    fetcher: async () =>
      await db
        .select()
        .from(issues)
        .leftJoin(readingProgress, eq(readingProgress.issueId, issues.id)),
  }),
});
