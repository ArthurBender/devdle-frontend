export const APP_START_DATE: string =
  import.meta.env.VITE_APP_START_DATE ?? "2026-05-12";

export function getPuzzleNumber(date: string): number {
  const start = new Date(APP_START_DATE + "T00:00:00Z");
  const target = new Date(date + "T00:00:00Z");
  return Math.floor((target.getTime() - start.getTime()) / 86_400_000) + 1;
}
