import { NextResponse } from "next/server";

type Params = {
  params: { userId: string };
};

export async function GET({ params }: Params) {
  const { userId } = params;
  const body = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Team To-Do//EN\nX-WR-CALNAME:Tasks for ${userId}\nEND:VCALENDAR`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${userId}.ics"`,
    },
  });
}
