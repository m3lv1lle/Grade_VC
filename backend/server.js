const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 file uploads

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Initialize Database Tables
const initDb = async () => {
  try {
    // Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        preferences JSONB DEFAULT '{}'
      );
    `);

    // Grades Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS grades (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        subject VARCHAR(100) NOT NULL,
        name VARCHAR(100) NOT NULL,
        score INTEGER NOT NULL,
        semester VARCHAR(10) NOT NULL,
        type VARCHAR(10) NOT NULL,
        date DATE NOT NULL,
        attachment TEXT,
        attachment_type VARCHAR(20),
        file_name VARCHAR(255)
      );
    `);
    console.log('Database tables initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Routes: Auth ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashed]
    );
    const token = jwt.sign({ id: result.rows[0].id, username }, JWT_SECRET);
    res.json({ token, user: result.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: 'Username likely taken' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(400).json({ message: 'User not found' });
    
    const user = result.rows[0];
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
      res.json({ token, user: { id: user.id, username: user.username, preferences: user.preferences } });
    } else {
      res.status(403).json({ message: 'Invalid password' });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, preferences FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) return res.sendStatus(404);
        res.json(result.rows[0]);
    } catch(e) {
        console.error(e);
        res.sendStatus(500);
    }
});

// Update User Preferences (Settings)
app.put('/api/auth/me', authenticateToken, async (req, res) => {
  const { preferences } = req.body;
  try {
    // Use coalesce to keep existing prefs if partial update, or replace entirely. 
    // Here we replace entirely as the frontend sends the full object.
    const result = await pool.query(
        'UPDATE users SET preferences = $1 WHERE id = $2 RETURNING preferences', 
        [preferences, req.user.id]
    );
    res.json({ success: true, preferences: result.rows[0].preferences });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to update preferences' });
  }
});

// Delete User
app.delete('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// --- Routes: Grades ---
app.get('/api/grades', authenticateToken, async (req, res) => {
  try {
      const result = await pool.query('SELECT * FROM grades WHERE user_id = $1 ORDER BY date DESC', [req.user.id]);
      const grades = result.rows.map(r => ({
        id: r.id,
        subject: r.subject,
        name: r.name,
        score: r.score,
        semester: r.semester,
        type: r.type,
        date: r.date, // Postgres returns Date object usually, frontend expects string in YYYY-MM-DD sometimes, but Date obj works with new Date()
        attachment: r.attachment,
        attachmentType: r.attachment_type,
        fileName: r.file_name
      }));
      res.json(grades);
  } catch (e) {
      console.error(e);
      res.sendStatus(500);
  }
});

app.post('/api/grades', authenticateToken, async (req, res) => {
  const { subject, name, score, semester, type, date, attachment, attachmentType, fileName } = req.body;
  try {
      const result = await pool.query(
        `INSERT INTO grades (user_id, subject, name, score, semester, type, date, attachment, attachment_type, file_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [req.user.id, subject, name, score, semester, type, date, attachment, attachmentType, fileName]
      );
      res.json({ id: result.rows[0].id, ...req.body });
  } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Error saving grade" });
  }
});

app.put('/api/grades/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { subject, name, score, semester, type, date, attachment, attachmentType, fileName } = req.body;
  try {
      // Ensure user owns the grade
      const check = await pool.query('SELECT id FROM grades WHERE id = $1 AND user_id = $2', [id, req.user.id]);
      if (check.rows.length === 0) return res.sendStatus(404);

      await pool.query(
        `UPDATE grades SET subject=$1, name=$2, score=$3, semester=$4, type=$5, date=$6, attachment=$7, attachment_type=$8, file_name=$9
         WHERE id=$10 AND user_id=$11`,
        [subject, name, score, semester, type, date, attachment, attachmentType, fileName, id, req.user.id]
      );
      res.json({ id: Number(id), ...req.body });
  } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Error updating grade" });
  }
});

app.delete('/api/grades/:id', authenticateToken, async (req, res) => {
  try {
      const result = await pool.query('DELETE FROM grades WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
      if (result.rowCount === 0) return res.sendStatus(404);
      res.json({ success: true });
  } catch (e) {
      console.error(e);
      res.sendStatus(500);
  }
});

// Start Server
app.listen(PORT, async () => {
  // Wait a moment for DB to be ready in Docker environment
  setTimeout(async () => {
    await initDb();
    console.log(`Server running on port ${PORT}`);
  }, 2000);
});