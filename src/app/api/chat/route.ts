import { NextRequest, NextResponse } from 'next/server';
import { ChatMessage, WeatherData } from '@/types/weather';

type ChatRequestBody = {
  messages: Pick<ChatMessage, 'role' | 'content'>[];
  weatherData: WeatherData;
};

export async function POST(req: NextRequest) {
  try {
    const { messages, weatherData } = (await req.json()) as ChatRequestBody;

    const groqKey = (process.env.GROQ_API_KEY || '').trim();
    const geminiKey = (process.env.GEMINI_API_KEY || '').trim();

    const systemPrompt = `You are "SkyCast AI", a friendly weather expert for ${weatherData.city}. 
    Current: ${Math.round(weatherData.current.temp)}°C, ${weatherData.current.condition}. 
    Rain Prob: ${Math.round(weatherData.current.precipitationProbability)}%.
    Next 1h: ${Math.round(weatherData.shortTermRain.next1h)}%.
    Be brief (2-3 sentences).`;

    // ─── TRY GROQ (Llama 3.3 70B - Latest & Fastest) ────────────────────────
    if (groqKey && !groqKey.includes('your_')) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile', 
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.map((m) => ({ role: m.role, content: m.content }))
            ],
            temperature: 0.7,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({ 
            role: 'assistant', 
            content: data.choices[0].message.content,
            model: 'groq-llama-3.3'
          });
        } else {
          const err = await res.json();
          console.error('Groq Error:', err.error?.message);
        }
      } catch (e) {
        console.error('Groq connection failed');
      }
    }

    // ─── FALLBACK TO GEMINI 1.5 FLASH ───────────────────────────────────────
    if (geminiKey && !geminiKey.includes('your_')) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt + "\nUser Question: " + messages[messages.length-1].content }] }]
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({ 
            role: 'assistant', 
            content: data.candidates?.[0]?.content?.parts?.[0]?.text || "...",
            model: 'gemini-1.5'
          });
        }
      } catch (e) {
        console.error('Gemini fallback failed');
      }
    }

    return NextResponse.json({ 
      role: 'assistant', 
      content: `I'm currently in manual mode. It's ${Math.round(weatherData.current.temp)}°C in ${weatherData.city}. No rain expected soon!`
    });

  } catch {
    return NextResponse.json({ role: 'assistant', content: "Connection error." }, { status: 500 });
  }
}
