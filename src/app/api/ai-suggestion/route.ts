import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { weatherData } = await req.json();
    const groqKey = (process.env.GROQ_API_KEY || '').trim();

    if (groqKey && !groqKey.includes('your_')) {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant', // Very fast for short blurbs
          messages: [{ 
            role: 'user', 
            content: `Give a 1-sentence weather tip for ${weatherData.city} (${Math.round(weatherData.current.temp)}°C, ${Math.round(weatherData.current.precipitationProbability)}% rain).` 
          }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ suggestion: data.choices[0].message.content });
      }
    }
    return NextResponse.json({ suggestion: "Enjoy your day! Stay updated with local reports." });
  } catch (e) {
    return NextResponse.json({ suggestion: "Check SkyCast radar for live updates." });
  }
}
