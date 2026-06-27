const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');

const getTrip = async (id) => {
  const trip = await get('SELECT * FROM trips WHERE id=?', [id]);
  if (!trip) return null;
  trip.suitcases = await all(`
    SELECT s.*, l.name as location_name, l.city
    FROM trip_suitcases ts
    JOIN suitcases s ON ts.suitcase_id = s.id
    LEFT JOIN locations l ON s.current_location_id = l.id
    WHERE ts.trip_id = ?
  `, [id]);
  return trip;
};

router.get('/', async (req, res) => {
  const trips = await all('SELECT * FROM trips ORDER BY start_date DESC, id DESC');
  const result = await Promise.all(trips.map(async t => {
    t.suitcases = await all(`
      SELECT s.*, l.name as location_name
      FROM trip_suitcases ts
      JOIN suitcases s ON ts.suitcase_id = s.id
      LEFT JOIN locations l ON s.current_location_id = l.id
      WHERE ts.trip_id = ?
    `, [t.id]);
    return t;
  }));
  res.json(result);
});

router.post('/', async (req, res) => {
  const { name, destination, start_date, end_date, notes } = req.body;
  const { lastInsertRowid } = await run(
    'INSERT INTO trips (name, destination, start_date, end_date, notes) VALUES (?, ?, ?, ?, ?)',
    [name, destination || null, start_date || null, end_date || null, notes || null]
  );
  res.json(await getTrip(lastInsertRowid));
});

router.put('/:id', async (req, res) => {
  const { name, destination, start_date, end_date, notes } = req.body;
  await run(
    'UPDATE trips SET name=?, destination=?, start_date=?, end_date=?, notes=? WHERE id=?',
    [name, destination || null, start_date || null, end_date || null, notes || null, req.params.id]
  );
  res.json(await getTrip(req.params.id));
});

router.patch('/:id/suitcases', async (req, res) => {
  const { suitcase_id, action } = req.body;
  if (action === 'add') {
    try {
      await run('INSERT INTO trip_suitcases (trip_id, suitcase_id) VALUES (?, ?)', [req.params.id, suitcase_id]);
    } catch (e) { /* already added */ }
  } else {
    await run('DELETE FROM trip_suitcases WHERE trip_id=? AND suitcase_id=?', [req.params.id, suitcase_id]);
  }
  res.json(await getTrip(req.params.id));
});

router.delete('/:id', async (req, res) => {
  await run('DELETE FROM trip_suitcases WHERE trip_id=?', [req.params.id]);
  await run('DELETE FROM trips WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
