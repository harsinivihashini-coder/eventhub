const express = require('express');
const pool = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, community, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, community, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin dashboard stats
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const [events, users, registrations] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM events'),
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      pool.query('SELECT COUNT(*)::int AS count FROM registrations'),
    ]);
    const upcoming = await pool.query(
      "SELECT COUNT(*)::int AS count FROM events WHERE event_date > NOW()"
    );
    res.json({
      totalEvents: events.rows[0].count,
      totalUsers: users.rows[0].count,
      totalRegistrations: registrations.rows[0].count,
      upcomingEvents: upcoming.rows[0].count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
