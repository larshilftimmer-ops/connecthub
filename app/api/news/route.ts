import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET() {
  try {
    const response = await fetch(
      "https://www.musikschulebadsoden.de/magazin",
      {
        cache: "no-store",
      }
    );

    const html = await response.text();

    const $ = cheerio.load(html);

    const news: any[] = [];

    $("h2").each((index, element) => {
      const title = $(element).text().trim();

      if (title.length > 5) {
        news.push({
          title,
        });
      }
    });

    return NextResponse.json(news.slice(0, 10));
  } catch (error) {
    return NextResponse.json({
      error: "News konnten nicht geladen werden.",
    });
  }
}