const express = require('express');
const router = express.Router();
const Waitlist = require('../models/Waitlist');

// POST /api/waitlist
router.post('/', async (req, res) => {
  const { email, concern } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Invalid email' });
  try {
    const entry = new Waitlist({ email, concern });
    await entry.save();
    res.json({ ok: true, id: entry._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
