const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('calculator.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expression TEXT,
      value REAL
    )
  `);
});

db.close();
