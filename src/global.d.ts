import type { issues } from '@/lib/db/schema';

declare global {
  type GlobalState = {
    theme: 'dark' | 'light';
    sourceFolder: string | null;
    toggleTheme: () => void;
    setSourceFolder: (path: string) => void;
  };

  type StagedItem = {
    uri: string;
    filename: string;
    sizeBytes: number;
    selected: boolean;
    status: ItemStatus;
    progress: number; // 0..1, meaningful while status === "extracting"
    series: string;
    title: string;
  };

  type ItemStatus = 'queued' | 'extracting' | 'done' | 'error';

  type Issue = typeof issues.$inferSelect;
  type NewIssue = typeof issues.$inferInsert;
}
