const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');

const withDetails = (id) => get(`
  SELECT s.*, l.name as location_name, l.city, l.country,
    COUNT(g.id) as garment_count
  FROM suitcases s
  LEFT JOIN locations l ON s.current_location_id = l.id
  LEFT JOIN garments g ON g.suitcase_id = s.id
  WHERE s.id = ?
  GROUP BY s.id
`, [id]);

router.get('/', async (req, res) => {
  const rows = await all(`
    SELECT s.*, l.name as location_name, l.city, l.country,
      COUNT(g.id) as garment_count
    FROM suitcases s
    LEFT JOIN locations l ON s.current_location_id = l.id
    LEFT JOIN garments g ON g.suitcase_id = s.id
    GROUP BY s.id ORDER BY s.name
  `);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name, current_location_id } = req.body;
  const { lastInsertRowid } = await run('INSERT INTO suitcases (name, current_location_id) VALUES (?, ?)', [name, current_location_id || null]);
  res.json(await withDetails(lastInsertRowid));
});

router.put('/:id', async (req, res) => {
  const { name, current_location_id } = req.body;
  await run('UPDATE suitcases SET name=?, current_location_id=? WHERE id=?', [name, current_location_id || null, req.params.id]);
  res.json(await withDetails(req.params.id));
});

router.patch('/:id/move', async (req, res) => {
  const { current_location_id } = req.body;
  await run('UPDATE suitcases SET current_location_id=? WHERE id=?', [current_location_id || null, req.params.id]);
  res.json(await withDetails(req.params.id));
});

router.delete('/:id', async (req, res) => {
  await run('UPDATE garments SET suitcase_id=NULL WHERE suitcase_id=?', [req.params.id]);
  await run('DELETE FROM trip_suitcases WHERE suitcase_id=?', [req.params.id]);
  await run('DELETE FROM suitcases WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
