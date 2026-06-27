const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'petate.db');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const db = new sqlite3.Database(DB_PATH);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastInsertRowid: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function exec(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, err => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function init() {
  await run('PRAGMA journal_mode = WAL');
  await run('PRAGMA foreign_keys = ON');

  await exec(`
    CREATE TABLE IF NOT EXISTS family_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#6366f1',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wardrobes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS suitcases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      current_location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      destination TEXT,
      start_date TEXT,
      end_date TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS trip_suitcases (
      trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
      suitcase_id INTEGER REFERENCES suitcases(id) ON DELETE CASCADE,
      PRIMARY KEY (trip_id, suitcase_id)
    );

    CREATE TABLE IF NOT EXISTS garments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'otros',
      owner_id INTEGER REFERENCES family_members(id) ON DELETE SET NULL,
      wardrobe_id INTEGER REFERENCES wardrobes(id) ON DELETE SET NULL,
      suitcase_id INTEGER REFERENCES suitcases(id) ON DELETE SET NULL,
      photo_path TEXT,
      condition TEXT DEFAULT 'buena',
      use_type TEXT DEFAULT 'salir',
      fit TEXT DEFAULT 'bien',
      season TEXT DEFAULT 'todo',
      rating INTEGER DEFAULT 3,
      brand TEXT,
      color TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const { c } = await get('SELECT COUNT(*) as c FROM family_members');
  if (c === 0) {
    await run("INSERT INTO family_members (name, role, color) VALUES ('Papá', 'padre', '#3b82f6')");
    await run("INSERT INTO family_members (name, role, color) VALUES ('Mamá', 'madre', '#ec4899')");
    await run("INSERT INTO family_members (name, role, color) VALUES ('Hijo 1', 'hijo', '#10b981')");
    await run("INSERT INTO family_members (name, role, color) VALUES ('Hijo 2', 'hijo', '#f59e0b')");

    const { lastInsertRowid: nyId } = await run("INSERT INTO locations (name, city, country) VALUES ('Casa Nueva York', 'Nueva York', 'Estados Unidos')");
    const { lastInsertRowid: esId } = await run("INSERT INTO locations (name, city, country) VALUES ('Casa España', 'España', 'España')");

    await run('INSERT INTO wardrobes (name, location_id) VALUES (?, ?)', ['Armario Principal', nyId]);
    await run('INSERT INTO wardrobes (name, location_id) VALUES (?, ?)', ['Armario Habitación', esId]);
    await run('INSERT INTO suitcases (name, current_location_id) VALUES (?, ?)', ['Maleta Grande', nyId]);
    await run('INSERT INTO suitcases (name, current_location_id) VALUES (?, ?)', ['Maleta de Mano', esId]);
  }
}

module.exports = { db, run, get, all, exec, init };
