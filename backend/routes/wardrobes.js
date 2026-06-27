const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');

const withDetails = (id) => get(`
  SELECT w.*, l.name as location_name, l.city, l.country,
    COUNT(g.id) as garment_count
  FROM wardrobes w
  LEFT JOIN locations l ON w.location_id = l.id
  LEFT JOIN garments g ON g.wardrobe_id = w.id
  WHERE w.id = ?
  GROUP BY w.id
`, [id]);

router.get('/', async (req, res) => {
  const rows = await all(`
    SELECT w.*, l.name as location_name, l.city, l.country,
      COUNT(g.id) as garment_count
    FROM wardrobes w
    LEFT JOIN locations l ON w.location_id = l.id
    LEFT JOIN garments g ON g.wardrobe_id = w.id
    GROUP BY w.id ORDER BY l.name, w.name
  `);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name, location_id } = req.body;
  const { lastInsertRowid } = await run('INSERT INTO wardrobes (name, location_id) VALUES (?, ?)', [name, location_id || null]);
  res.json(await withDetails(lastInsertRowid));
});

router.put('/:id', async (req, res) => {
  const { name, location_id } = req.body;
  await run('UPDATE wardrobes SET name=?, location_id=? WHERE id=?', [name, location_id || null, req.params.id]);
  res.json(await withDetails(req.params.id));
});

router.delete('/:id', async (req, res) => {
  await run('UPDATE garments SET wardrobe_id=NULL WHERE wardrobe_id=?', [req.params.id]);
  await run('DELETE FROM wardrobes WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
