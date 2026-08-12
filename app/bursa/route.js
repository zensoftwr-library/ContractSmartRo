import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = 'https://query1.finance.yahoo.com/v7/finance/quote?symbols=^BET,^GSPC,^IXIC';
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      next: { revalidate: 30 } // Cache-uiește răspunsul 30 de secunde
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, message: 'Yahoo API Error' }, { status: 500 });
    }

    const data = await response.json();
    const quotes = data?.quoteResponse?.result || [];

    return NextResponse.json({ success: true, quotes });

  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server Fetch Error' }, { status: 500 });
  }
}