import CalendarHeatmapLib from "react-calendar-heatmap";
import { useLocalStats } from "../../hooks/useLocalStats";

export function CalendarHeatmap() {
  const stats = useLocalStats();
  const today = new Date().toISOString().slice(0, 10);
  const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const solvedByDate: Record<string, number> = {};
  for (const a of stats.history) {
    if (a.solved) {
      solvedByDate[a.date] = (solvedByDate[a.date] ?? 0) + 1;
    }
  }

  const values = Object.entries(solvedByDate).map(([date, count]) => ({ date, count }));

  return (
    <div>
      <CalendarHeatmapLib
        startDate={startDate}
        endDate={today}
        values={values}
        classForValue={(value) => {
          if (!value || value.count === 0) return "heatmap-empty";
          if (value.count === 1) return "heatmap-scale-1";
          if (value.count === 2) return "heatmap-scale-2";
          if (value.count <= 4) return "heatmap-scale-3";
          return "heatmap-scale-4";
        }}
        showMonthLabels
        gutterSize={2}
      />
      <div className="flex items-center justify-end gap-1 mt-1.5 text-xs text-text-secondary">
        <span className="mr-0.5">Less</span>
        {(["heatmap-empty", "heatmap-scale-1", "heatmap-scale-2", "heatmap-scale-3", "heatmap-scale-4"] as const).map((cls) => (
          <svg key={cls} width="10" height="10" className="shrink-0">
            <rect width="10" height="10" rx="2" className={cls} />
          </svg>
        ))}
        <span className="ml-0.5">More</span>
      </div>
    </div>
  );
}
