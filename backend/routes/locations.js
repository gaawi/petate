const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');

router.get('/', async (req, res) => {
  const rows = await all(`
    SELECT l.*,
      (SELECT COUNT(*) FROM wardrobes WHERE location_id = l.id) as wardrobe_count,
      (SELECT COUNT(*) FROM suitcases WHERE current_location_id = l.id) as suitcase_count
    FROM locations l ORDER BY l.id
  `);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name, city, country } = req.body;
  const { lastInsertRowid } = await run('INSERT INTO locations (name, city, country) VALUES (?, ?, ?)', [name, city, country]);
  res.json(await get('SELECT *, 0 as wardrobe_count, 0 as suitcase_count FROM locations WHERE id=?', [lastInsertRowid]));
});

router.put('/:id', async (req, res) => {
  const { name, city, country } = req.body;
  await run('UPDATE locations SET name=?, city=?, country=? WHERE id=?', [name, city, country, req.params.id]);
  res.json(await get('SELECT * FROM locations WHERE id=?', [req.params.id]));
});

router.delete('/:id', async (req, res) => {
  await run('DELETE FROM locations WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
