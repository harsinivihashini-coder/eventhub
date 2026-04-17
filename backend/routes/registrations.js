const express = require('express');
const pool = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register for event
router.post('/:eventId', auth, async (req, res) => {
  const { eventId } = req.params;
  try {
    const event = await pool.query(
      'SELECT capacity, (SELECT COUNT(*) FROM registrations WHERE event_id=$1)::int AS count FROM events WHERE id=$1',
      [eventId]
    );
    if (!event.rows.length) return res.status(404).json({ error: 'Event not found.' });
    if (event.rows[0].count >= event.rows[0].capacity)
      return res.status(400).json({ error: 'Event is at full capacity.' });

    await pool.query('INSERT INTO registrations (user_id, event_id) VALUES ($1,$2)', [req.user.id, eventId]);
    res.status(201).json({ message: 'Successfully registered for event.' });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Already registered for this event.' });
    res.status(500).json({ error: err.message });
  }
});

// Unregister from event
router.delete('/:eventId', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM registrations WHERE user_id=$1 AND event_id=$2 RETURNING id',
      [req.user.id, req.params.eventId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Registration not found.' });
    res.json({ message: 'Successfully unregistered from event.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's registered events
router.get('/my/events', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, r.registered_at,
        COUNT(reg.id)::int AS registered_count
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      LEFT JOIN registrations reg ON reg.event_id = e.id
      WHERE r.user_id = $1
      GROUP BY e.id, r.registered_at
      ORDER BY e.event_date ASC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
