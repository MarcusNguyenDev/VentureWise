import type { Story } from "@/lib/api/api_contracts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StubBadge } from "@/components/ui/stub_badge";

const STAR_ROWS: { key: keyof Story; label: string }[] = [
  { key: "situation", label: "Situation" },
  { key: "task", label: "Task" },
  { key: "action", label: "Action" },
  { key: "result", label: "Result" },
];

export function StoryCard({
  story,
  onDelete,
}: {
  story: Story;
  onDelete: (story_id: string) => void;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-ink">
            {story.title}
          </h3>
          <p className="mt-0.5 text-[11px] text-ink-faint">
            written in {story.detected_language}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {story.is_stubbed ? <StubBadge /> : null}
          <Button
            tone="ghost"
            size="small"
            onClick={() => onDelete(story.story_id)}
            aria-label={`Delete ${story.title}`}
          >
            Delete
          </Button>
        </div>
      </div>

      <dl className="mt-4 space-y-2.5">
        {STAR_ROWS.map((row) => (
          <div key={row.key} className="grid grid-cols-[70px_1fr] gap-3">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
              {row.label}
            </dt>
            <dd className="text-xs leading-relaxed text-ink-muted">
              {String(story[row.key])}
            </dd>
          </div>
        ))}
      </dl>

      {story.themes.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-1.5 border-t border-line pt-3">
          {story.themes.map((theme) => (
            <li
              key={theme}
              className="rounded-full bg-surface-sunken px-2 py-0.5 text-[10px] text-ink-muted"
            >
              {theme}
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
