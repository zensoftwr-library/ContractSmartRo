import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Adăugăm TOATE posibilitățile de câmpuri media pentru extragere poze
    const parser = new Parser({
      customFields: {
        item: ['media:content', 'media:thumbnail', 'enclosure', 'content:encoded', 'description']
      }
    });
    
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
          return feed.items.slice(0, 2).map(item => {
            let imagineReala = null;

            // 1. Verificare <media:thumbnail> sau <media:content>
            if (item['media:thumbnail'] && item['media:thumbnail'].$) {
              imagineReala = item['media:thumbnail'].$.url;
            } else if (item['media:content'] && item['media:content'].$) {
              imagineReala = item['media:content'].$.url;
            }
            // 2. Verificare <enclosure>
            else if (item.enclosure && item.enclosure.url) {
              imagineReala = item.enclosure.url;
            } 
            // 3. Extragere regex din content sau description (src="...")
            else {
              const htmlContent = item['content:encoded'] || item.content || item.description || '';
              const imgMatch = htmlContent.match(/<img[^>]+src="([^">]+)"/i);
              if (imgMatch && imgMatch[1]) {
                imagineReala = imgMatch[1];
              }
            }

            // 4. FALLBACK VIZUAL ELEGANT: Dacă știrea chiar nu are poză, punem una profi de business/legal
            if (!imagineReala) {
              imagineReala = 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600';
            }

            return {
              sursa: f.sursa,
              titlu: item.title,
              link: item.link,
              imagine: imagineReala
            };
          });
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