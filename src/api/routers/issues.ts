import { eq } from 'drizzle-orm';
import { Effect } from 'effect';
import { router } from 'react-query-kit';
import runtime from '@/lib/core';
import { ArchiveService } from '@/lib/core/archive-service';
import db from '@/lib/db';
import { issues, readingProgress } from '@/lib/db/schema';

export const issuesRouter = router('issues', {
  getIssueById: router.query({
    fetcher: async (variables: { issueId: string }) => {
      const rows = await db
        .select({
          filePath: issues.filePath,
          currentPage: readingProgress.currentPage,
        })
        .from(issues)
        .leftJoin(readingProgress, eq(readingProgress.issueId, issues.id))
        .where(eq(issues.id, variables.issueId));

      const row = rows[0];

      if (!row) throw new Error(`No issue found for ${variables.issueId}`);

      const manifest = await runtime.runPromise(
        ArchiveService.pipe(Effect.flatMap((svc) => svc.index(row.filePath))),
      );

      return { manifest, startPage: row.currentPage ?? 0 };
    },
  }),
});
