import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const parser = new Parser();
    
    // Definirea surselor multiple pe domenii diferite
    const fluxuri = [
      { sursa: "Ziarul Financiar", url: "https://www.zf.ro/rss" },
      { sursa: "Profit.ro", url: "https://www.profit.ro/rss" },
      { sursa: "StartupCafe.ro", url: "https://www.startupcafe.ro/feed" }
    ];

    // Interogăm toate sursele în paralel folosind Promise.all
    const promisiuni = fluxuri.map(async (f) => {
      try {
        const feed = await parser.parseURL(f.url);
        
        if (feed && feed.items) {
          // Luăm primele 2 știri din fiecare sursă
          return feed.items.slice(0, 2).map(item => ({
            sursa: f.sursa,
            titlu: item.title,
            link: item.link
          }));
        }
        return [];
      } catch (err) {
        console.error(`Eroare la preluarea fluxului pentru ${f.sursa}:`, err);
        return [];
      }
    });

    const rezultateParalele = await Promise.all(promisiuni);
    
    // Unificăm array-urile de știri într-unul singur (total 6 știri din 3 surse)
    const stiriCombinate = rezultateParalele.flat();

    if (stiriCombinate.length > 0) {
      return NextResponse.json({ success: true, stiri: stiriCombinate });
    } else {
      throw new Error("Nu s-a putut prelua nicio știre din fluxurile RSS.");
    }

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}