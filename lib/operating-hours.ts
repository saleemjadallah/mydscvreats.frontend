import type { DaySchedule, OperatingHoursConfig } from "@/types";

export const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const GULF_TIMEZONES = [
  "Asia/Dubai",
  "Asia/Riyadh",
  "Asia/Qatar",
  "Asia/Bahrain",
  "Asia/Kuwait",
  "Asia/Muscat",
] as const;

export { GULF_TIMEZONES };

export function createDefaultSchedule(): OperatingHoursConfig {
  return {
    timezone: "Asia/Dubai",
    schedule: Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      isClosed: false,
      periods: [{ open: "09:00", close: "23:00" }],
    })),
  };
}

export function formatTime(time24: string): string {
  const [hoursStr, minutesStr] = time24.split(":");
  const hours = parseInt(hoursStr, 10);
  const minutes = minutesStr;
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return minutes === "00"
    ? `${displayHours} ${suffix}`
    : `${displayHours}:${minutes} ${suffix}`;
}

export function getOpenStatus(
  config: OperatingHoursConfig
): { isOpen: boolean; label: string } {
  const now = new Date();

  // Get current time in the restaurant's timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: config.timezone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    weekday: "short",
  });
  const parts = formatter.formatToParts(now);
  const weekdayStr = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = parseInt(
    parts.find((p) => p.type === "hour")?.value ?? "0",
    10
  );
  const minute = parseInt(
    parts.find((p) => p.type === "minute")?.value ?? "0",
    10
  );
  const currentMinutes = hour * 60 + minute;

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const todayDow = weekdayMap[weekdayStr] ?? now.getDay();

  const today = config.schedule.find((d) => d.dayOfWeek === todayDow);
  if (!today) {
    return { isOpen: false, label: "Closed" };
  }

  if (!today.isClosed) {
    // Check if currently in an open period
    for (const period of today.periods) {
      const openMinutes = parseTime(period.open);
      const closeMinutes = parseTime(period.close);
      if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
        return {
          isOpen: true,
          label: `Open · Closes ${formatTime(period.close)}`,
        };
      }
    }

    // Not currently open — find next open period today
    const nextPeriodToday = today.periods.find(
      (p) => parseTime(p.open) > currentMinutes
    );
    if (nextPeriodToday) {
      return {
        isOpen: false,
        label: `Opens ${formatTime(nextPeriodToday.open)}`,
      };
    }
  }

  // Find next open day
  for (let offset = 1; offset <= 7; offset++) {
    const nextDow = (todayDow + offset) % 7;
    const nextDay = config.schedule.find((d) => d.dayOfWeek === nextDow);
    if (nextDay && !nextDay.isClosed && nextDay.periods.length > 0) {
      const firstPeriod = nextDay.periods[0];
      if (offset === 1) {
        return {
          isOpen: false,
          label: `Opens tomorrow ${formatTime(firstPeriod.open)}`,
        };
      }
      return {
        isOpen: false,
        label: `Opens ${DAY_LABELS[nextDow]} ${formatTime(firstPeriod.open)}`,
      };
    }
  }

  return { isOpen: false, label: "Closed" };
}

function parseTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
