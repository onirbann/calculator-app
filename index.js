
const { Pool } = require('pg');

// Replace this with your actual connection string
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_XtJUmx79VvrT@ep-sparkling-hall-a1l38qla-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});


const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Defining the homepage 

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));



// Route: Add a new calculation

app.post('/calculate', async (req, res) => {
  const { expression } = req.body;

  try {
    const value = eval(expression); // For learning only — don’t use in production!

    const result = await pool.query(
      'INSERT INTO results (expression, value) VALUES ($1, $2) RETURNING id',
      [expression, value]
    );

    const id = result.rows[0].id;
    const label = `Result ${id}`;
    res.json({ label, value });
  } catch (err) {
    console.error('Error:', err);
    res.status(400).json({ error: 'Invalid expression or database error' });
  }
});


// Route: Get a specific result by ID
app.get('/result/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const result = await pool.query('SELECT * FROM results WHERE id = $1', [id]);

    if (result.rows.length > 0) {
      const row = result.rows[0];
      res.json({ label: `Result ${row.id}`, value: row.value });
    } else {
      res.status(404).json({ error: 'Result not found' });
    }
  } catch (err) {
    console.error('DB read error:', err);
    res.status(500).json({ error: 'Database read failed' });
  }
});


app.post('/calculate-from-results', async (req, res) => {
  const { id1, id2 } = req.body;

  try {
    const query = 'SELECT id, value FROM results WHERE id = $1 OR id = $2';
    const result = await pool.query(query, [id1, id2]);

    if (result.rows.length < 2) {
      return res.status(404).json({ error: 'One or both results not found' });
    }

    const values = result.rows.map(row => row.value);
    const total = values[0] + values[1];

    res.json({ result: total });
  } catch (err) {
    console.error('DB fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

  

app.listen(port, () => {
    console.log(`Calculator API running on http://localhost:${port}`);
});