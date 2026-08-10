import { issuesRouter } from './routers/issues';
import { readingRouter } from './routers/reading';

export const app = {
  issues: issuesRouter,
  reading: readingRouter,
};
