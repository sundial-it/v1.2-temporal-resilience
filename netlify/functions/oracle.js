// netlify/functions/oracle.js
//
// This runs on Netlify's server, NOT in the visitor's browser.
// Your real Gemini API key lives in an environment variable here,
// so it's never exposed in page source. See README.md for setup.

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GEMINI_API_KEY is not set in Netlify environment variables yet.' })
    };
  }

  let prompt;
  try {
    ({ prompt } = JSON.parse(event.body));
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }
  if (!prompt || typeof prompt !== 'string') {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing prompt' }) };
  }

  const systemPrompt = "You are Sundial IT Consultancy's chief post-quantum cryptography engineer and cloud security architect. Answer questions about Shor's factorization threat, Learning With Errors (LWE), Kyber, and dynamic chronometric or chronological cryptography. Keep answers concise, deeply professional, and styled for a cyber terminal interface under 4 paragraphs. Do not mention that you are an AI.";

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      }
    );

    if (!geminiRes.ok) {
      return { statusCode: 502, body: JSON.stringify({ error: 'Upstream Gemini error: ' + geminiRes.status }) };
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No payload recovered.";

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Oracle backend failure: ' + err.message }) };
  }
};
