const express = require('express');
const pool = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all events with registration count
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, u.name AS organizer,
        COUNT(r.id)::int AS registered_count,
        EXISTS(SELECT 1 FROM registrations WHERE user_id=$1 AND event_id=e.id) AS is_registered
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN registrations r ON r.event_id = e.id
      GROUP BY e.id, u.name
      ORDER BY e.event_date ASC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single event
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await pool.query(`
      SELECT e.*, u.name AS organizer,
        COUNT(r.id)::int AS registered_count,
        EXISTS(SELECT 1 FROM registrations WHERE user_id=$1 AND event_id=e.id) AS is_registered
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN registrations r ON r.event_id = e.id
      WHERE e.id = $2
      GROUP BY e.id, u.name
    `, [req.user.id, req.params.id]);

    if (!event.rows.length) return res.status(404).json({ error: 'Event not found.' });

    const attendees = await pool.query(
      'SELECT u.id, u.name, u.email, u.community FROM registrations r JOIN users u ON r.user_id = u.id WHERE r.event_id = $1',
      [req.params.id]
    );
    res.json({ ...event.rows[0], attendees: attendees.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create event (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  const { title, description, location, event_date, capacity, image_url, category } = req.body;
  if (!title || !event_date) return res.status(400).json({ error: 'Title and date required.' });

  try {
    const result = await pool.query(
      'INSERT INTO events (title, description, location, event_date, capacity, image_url, category, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [title, description, location, event_date, capacity || 50, image_url, category, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update event (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  const { title, description, location, event_date, capacity, image_url, category } = req.body;
  try {
    const result = await pool.query(
      'UPDATE events SET title=$1, description=$2, location=$3, event_date=$4, capacity=$5, image_url=$6, category=$7 WHERE id=$8 RETURNING *',
      [title, description, location, event_date, capacity, image_url, category, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Event not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete event (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM events WHERE id = $1', [req.params.id]);
    res.json({ message: 'Event deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
