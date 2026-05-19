import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().slice(0, 10);
  const prevDate = addDays(date, -1);
  const nextDate = addDays(date, 1);
  const isAtStart = date <= APP_START_DATE;
  const isAtToday = date >= today;

  function openDatePicker() {
    const input = dateInputRef.current;
    if (!input) return;
    if (input.showPicker) {
      input.showPicker();
    } else {
      input.focus();
    }
  }

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
      <div className="relative">
        <button
          onClick={openDatePicker}
          className="flex items-center gap-1.5 text-text-secondary text-xs px-3 py-1.5 rounded-md border border-border bg-surface min-w-44 justify-center cursor-pointer hover:text-text-primary transition-colors"
          aria-label="Pick a date"
        >
          <FiCalendar size={12} />
          <span>{formatDate(date)}</span>
        </button>
        <input
          ref={dateInputRef}
          type="date"
          className="absolute opacity-0 pointer-events-none w-full bottom-0 left-0"
          value={date}
          min={APP_START_DATE}
          max={today}
          onChange={(e) => { if (e.target.value) navigate(`/${e.target.value}`); }}
        />
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
