import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";
import { APP_START_DATE } from "../../config";

interface DateNavProps {
  date: string;
}

function formatDate(date: string): string {
  return new Date(date + "T00:00:00Z").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function addDays(date: string, n: number): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function DateNav({ date }: DateNavProps) {
  const today = new Date().toISOString().slice(0, 10);
  const prevDate = addDays(date, -1);
  const nextDate = addDays(date, 1);
  const isAtStart = date <= APP_START_DATE;
  const isAtToday = date >= today;

  return (
    <div className="flex items-center gap-0.5">
      {isAtStart ? (
        <span className="p-1.5 text-text-secondary/30 cursor-not-allowed">
          <FiChevronLeft size={15} />
        </span>
      ) : (
        <Link
          to={`/${prevDate}`}
          className="p-1.5 text-text-secondary hover:text-text-primary transition-colors rounded"
          aria-label="Previous day"
        >
          <FiChevronLeft size={15} />
        </Link>
      )}
      <div className="flex items-center gap-1.5 text-text-secondary text-xs px-3 py-1.5 rounded-md border border-border bg-surface min-w-44 justify-center">
        <FiCalendar size={12} />
        <span>{formatDate(date)}</span>
      </div>
      {isAtToday ? (
        <span className="p-1.5 text-text-secondary/30 cursor-not-allowed">
          <FiChevronRight size={15} />
        </span>
      ) : (
        <Link
          to={`/${nextDate}`}
          className="p-1.5 text-text-secondary hover:text-text-primary transition-colors rounded"
          aria-label="Next day"
        >
          <FiChevronRight size={15} />
        </Link>
      )}
    </div>
  );
}
