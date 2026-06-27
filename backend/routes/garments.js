const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');

const BASE_Q = `
  SELECT g.*,
    fm.name as owner_name, fm.color as owner_color, fm.role as owner_role,
    w.name as wardrobe_name,
    wl.name as wardrobe_location_name, wl.city as wardrobe_location_city,
    s.name as suitcase_name,
    sl.name as suitcase_location_name, sl.city as suitcase_location_city
  FROM garments g
  LEFT JOIN family_members fm ON g.owner_id = fm.id
  LEFT JOIN wardrobes w ON g.wardrobe_id = w.id
  LEFT JOIN locations wl ON w.location_id = wl.id
  LEFT JOIN suitcases s ON g.suitcase_id = s.id
  LEFT JOIN locations sl ON s.current_location_id = sl.id
`;

router.get('/', async (req, res) => {
  const { owner_id, category, season, use_type, condition, fit, wardrobe_id, suitcase_id, search } = req.query;
  let q = BASE_Q + ' WHERE 1=1';
  const params = [];

  if (owner_id) { q += ' AND g.owner_id=?'; params.push(owner_id); }
  if (category) { q += ' AND g.category=?'; params.push(category); }
  if (season && season !== 'todo') { q += ' AND (g.season=? OR g.season="todo")'; params.push(season); }
  if (use_type) { q += ' AND g.use_type=?'; params.push(use_type); }
  if (condition) { q += ' AND g.condition=?'; params.push(condition); }
  if (fit) { q += ' AND g.fit=?'; params.push(fit); }
  if (wardrobe_id) { q += ' AND g.wardrobe_id=?'; params.push(wardrobe_id); }
  if (suitcase_id) { q += ' AND g.suitcase_id=?'; params.push(suitcase_id); }
  if (search) { q += ' AND (g.name LIKE ? OR g.brand LIKE ? OR g.notes LIKE ?)'; const s = `%${search}%`; params.push(s, s, s); }

  q += ' ORDER BY g.created_at DESC';
  res.json(await all(q, params));
});

router.get('/stats', async (req, res) => {
  const { c: total } = await get('SELECT COUNT(*) as c FROM garments');
  const byOwner = await all(`
    SELECT fm.id, fm.name, fm.color, COUNT(g.id) as count
    FROM family_members fm LEFT JOIN garments g ON g.owner_id = fm.id GROUP BY fm.id
  `);
  const byCategory = await all('SELECT category, COUNT(*) as count FROM garments GROUP BY category ORDER BY count DESC');
  const byUseType = await all('SELECT use_type, COUNT(*) as count FROM garments GROUP BY use_type ORDER BY count DESC');
  const bySeason = await all('SELECT season, COUNT(*) as count FROM garments GROUP BY season');
  res.json({ total, byOwner, byCategory, byUseType, bySeason });
});

router.get('/:id', async (req, res) => {
  const g = await get(BASE_Q + ' WHERE g.id=?', [req.params.id]);
  if (!g) return res.status(404).json({ error: 'No encontrado' });
  res.json(g);
});

router.post('/', async (req, res) => {
  const { name, category, owner_id, wardrobe_id, suitcase_id, photo_path, condition, use_type, fit, season, rating, brand, color, notes } = req.body;
  const { lastInsertRowid } = await run(`
    INSERT INTO garments (name, category, owner_id, wardrobe_id, suitcase_id, photo_path, condition, use_type, fit, season, rating, brand, color, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [name, category || 'otros', owner_id || null, wardrobe_id || null, suitcase_id || null,
    photo_path || null, condition || 'buena', use_type || 'salir', fit || 'bien', season || 'todo', rating || 3,
    brand || null, color || null, notes || null]);
  res.json(await get(BASE_Q + ' WHERE g.id=?', [lastInsertRowid]));
});

router.put('/:id', async (req, res) => {
  const { name, category, owner_id, wardrobe_id, suitcase_id, photo_path, condition, use_type, fit, season, rating, brand, color, notes } = req.body;
  await run(`
    UPDATE garments SET name=?, category=?, owner_id=?, wardrobe_id=?, suitcase_id=?,
    photo_path=?, condition=?, use_type=?, fit=?, season=?, rating=?, brand=?, color=?, notes=?
    WHERE id=?
  `, [name, category, owner_id || null, wardrobe_id || null, suitcase_id || null,
    photo_path || null, condition, use_type, fit, season, rating,
    brand || null, color || null, notes || null, req.params.id]);
  res.json(await get(BASE_Q + ' WHERE g.id=?', [req.params.id]));
});

router.delete('/:id', async (req, res) => {
  await run('DELETE FROM garments WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
