const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');

router.get('/', async (req, res) => {
  const rows = await all(`
    SELECT m.*, COUNT(g.id) as garment_count
    FROM family_members m
    LEFT JOIN garments g ON g.owner_id = m.id
    GROUP BY m.id ORDER BY m.id
  `);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name, role, color } = req.body;
  const { lastInsertRowid } = await run('INSERT INTO family_members (name, role, color) VALUES (?, ?, ?)', [name, role, color || '#6366f1']);
  res.json(await get('SELECT *, 0 as garment_count FROM family_members WHERE id = ?', [lastInsertRowid]));
});

router.put('/:id', async (req, res) => {
  const { name, role, color } = req.body;
  await run('UPDATE family_members SET name=?, role=?, color=? WHERE id=?', [name, role, color, req.params.id]);
  res.json(await get('SELECT *, 0 as garment_count FROM family_members WHERE id=?', [req.params.id]));
});

router.delete('/:id', async (req, res) => {
  await run('DELETE FROM family_members WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
