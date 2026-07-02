const express = require('express');
const router = express.Router();

// Oracle proxy: uses OpenAI if OPENAI_API_KEY is provided; otherwise returns a stub.
// Set OPENAI_API_KEY in the server environment (or use another provider and adapt).
const OpenAI = require('openai');
let openaiClient = null;
if (process.env.OPENAI_API_KEY) {
  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

router.post('/', async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  if (!openaiClient) {
    const answer = `(Stub) Received prompt: ${prompt.slice(0, 200)}`;
    return res.json({ text: answer, stub: true });
  }

  try {
    const completion = await openaiClient.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
    });

    const text = completion?.choices?.[0]?.message?.content || completion?.choices?.[0]?.text || '';
    res.json({ text });
  } catch (err) {
    console.error('Oracle error:', err?.message || err);
    res.status(500).json({ error: 'Oracle error', details: err?.message || String(err) });
  }
});

module.exports = router;
