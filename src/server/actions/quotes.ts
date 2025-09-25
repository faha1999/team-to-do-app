import { requireUser } from "@/lib/auth";

export async function getDailyQuote() {
  await requireUser();
  // TODO: fetch from quotes data source.
  return {
    id: "quote_of_the_day",
    text: "Focus is the ultimate luxury.",
    author: "Team To-Do",
  };
}
