export type RecurrenceRule = {
  freq: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval?: number;
  byweekday?: number[];
  bymonthday?: number[];
};

export function parseRRule(value: string): RecurrenceRule | null {
  if (!value) return null;
  // TODO: Parse RFC 5545 RRULE string properly.
  return { freq: "DAILY" };
}

export function stringifyRRule(rule: RecurrenceRule): string {
  // TODO: Serialize to RFC 5545 compliant RRULE.
  return `FREQ=${rule.freq}`;
}
