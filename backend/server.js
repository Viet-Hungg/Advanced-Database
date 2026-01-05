const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

// MySQL connection config 
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: '11',
  database: 'test'
};


async function getConnection() {
  return await mysql.createConnection(DB_CONFIG);
}

// GET /api/media
app.get('/api/media', async (req, res) => {
  const userId = req.query.userId || null;
  try {
    const conn = await getConnection();

    const [mediaRows] = await conn.execute(`
      SELECT 
        m.media_ID,
        m.title,
        m.description,
        m.release_date,
        m.type,
        mv.duration,
        mv.box_office,
        s.total_seasons,
        ROUND(AVG(r.score), 1) AS rating,
        CONCAT('https://picsum.photos/seed/', m.media_ID, '/500/750') AS poster,
        CONCAT('https://picsum.photos/seed/', m.media_ID, '/1280/720') AS backdrop
      FROM Media m
      LEFT JOIN Movie mv ON mv.media_ID = m.media_ID
      LEFT JOIN Series s ON s.media_ID = m.media_ID
      LEFT JOIN Rating r ON r.media_ID = m.media_ID
      GROUP BY m.media_ID
      ORDER BY m.release_date DESC;
    `);

    const [genreRows] = await conn.execute(`
      SELECT mg.media_ID, mg.genre_ID, g.genre_name 
      FROM Media_Genre mg
      JOIN Genre g ON g.genre_ID = mg.genre_ID;
    `);

    const [actorRows] = await conn.execute(`
      SELECT ma.media_ID, a.actor_ID, CONCAT(a.first_name, ' ', a.last_name) AS name
      FROM Media_Actor ma
      JOIN Actor a ON a.actor_ID = ma.actor_ID;
    `);

    const [directorRows] = await conn.execute(`
      SELECT md.media_ID, d.director_ID, CONCAT(d.first_name, ' ', d.last_name) AS name
      FROM Media_Director md
      JOIN Director d ON d.director_ID = md.director_ID;
    `);

    let watchlistSet = new Set();
    if (userId) {
      const [watchRows] = await conn.execute(`SELECT media_ID FROM WatchList WHERE user_ID = ?`, [userId]);
      watchRows.forEach(row => watchlistSet.add(row.media_ID));
    }

    await conn.end();

    const genresByMedia = genreRows.reduce((acc, row) => {
      if (!acc[row.media_ID]) acc[row.media_ID] = [];
      acc[row.media_ID].push({ id: row.genre_ID, name: row.genre_name });
      return acc;
    }, {});

    const actorsByMedia = actorRows.reduce((acc, row) => {
      if (!acc[row.media_ID]) acc[row.media_ID] = [];
      acc[row.media_ID].push({ id: row.actor_ID, name: row.name });
      return acc;
    }, {});

    const directorsByMedia = directorRows.reduce((acc, row) => {
      if (!acc[row.media_ID]) acc[row.media_ID] = [];
      acc[row.media_ID].push({ id: row.director_ID, name: row.name });
      return acc;
    }, {});

    const result = mediaRows.map(m => ({
      ...m,
      rating: m.rating ? Number(m.rating) : null,
      genre_ids: (genresByMedia[m.media_ID] || []).map(g => g.id),
      genres: (genresByMedia[m.media_ID] || []).map(g => g.name),
      actor_ids: (actorsByMedia[m.media_ID] || []).map(a => a.id),
      actors: (actorsByMedia[m.media_ID] || []).map(a => a.name),
      director_ids: (directorsByMedia[m.media_ID] || []).map(d => d.id),
      directors: (directorsByMedia[m.media_ID] || []).map(d => d.name),
      quality: m.type === 'Movie' ? 'HD' : 'Full HD',
      in_watchlist: watchlistSet.has(m.media_ID)
    }));

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error", details: err.message });
  }
});


// POST /api/login (FIX R1/R2)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const conn = await getConnection();
    const [rows] = await conn.execute(
      'SELECT * FROM user WHERE email = ? OR username = ? LIMIT 1',
      [email, email]
    );
    await conn.end();

    if (rows.length === 0) {
      return res.json({ success: false, message: 'User not found' });
    }
  
    const user = rows[0];
  
    // ============= FIX ROLE R1 / R2 =============
    let role = "user";

    if (user.R2 && user.R2.toUpperCase() === "R2") {
      role = "admin";
    }
    if (user.R1 && user.R1.toUpperCase() === "R1") {
      role = "user";
    }
    // ============================================

    if (password === user.password || password === "") {
      delete user.password;

      return res.json({
        success: true,
        user: {
          ...user,
          role: role
        }
      });
    }

    return res.json({ success: false, message: "Invalid credentials" });
    return res.json({ success: false, message: "Invalid credentials" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error", details: err.message });
  }
});

// ==========================
// ADMIN: ADD USER
// ==========================
app.post('/api/users/add', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const conn = await getConnection();
    const sql = `
      INSERT INTO user (username, email, password, role)
      VALUES (?, ?, ?, ?)
    `;
    await conn.execute(sql, [username, email, password || '', role || 'user']);
    await conn.end();

    res.json({ success: true, message: "User added!" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
});


// ==========================
// ADMIN: EDIT USER
// ==========================
app.put('/api/users/edit/:id', async (req, res) => {
  const userId = req.params.id;
  const { username, email, password, role } = req.body;

  try {
    const conn = await getConnection();
    const sql = `
      UPDATE user 
      SET username=?, email=?, password=?, role=?
      WHERE user_ID = ?
    `;
    await conn.execute(sql, [username, email, password, role, userId]);
    await conn.end();

    res.json({ success: true, message: "User updated!" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
});


// ==========================
// MEDIA: ADD GENRES
// ==========================
// Nhớ thêm cột genres trong MySQL:
// ALTER TABLE Media ADD genres VARCHAR(255);
app.put('/api/media/genres/:id', async (req, res) => {
  const mediaId = req.params.id;
  const { genres } = req.body;

  try {
    const conn = await getConnection();
    await conn.execute(
      "UPDATE Media SET genres=? WHERE media_ID=?",
      [genres, mediaId]
    );
    await conn.end();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});


// ==========================
// RELATED MOVIES
// ==========================
app.get('/api/media/:id/related', async (req, res) => {
  const mediaId = req.params.id;

  try {
    const conn = await getConnection();

    // Lấy phim chính
    const [current] = await conn.execute(
      "SELECT * FROM Media WHERE media_ID = ?",
      [mediaId]
    );
    if (!current.length) return res.json([]);

    const genre = current[0].genres;

    // Lấy phim liên quan
    const [related] = await conn.execute(
      "SELECT * FROM Media WHERE genres = ? AND media_ID != ? LIMIT 10",
      [genre, mediaId]
    );

    await conn.end();
    res.json(related);

  } catch (err) {
    console.error(err);
    res.json([]);
  }
});


// ==========================
// COMMENTS + RATINGS
// ==========================
// Tạo bảng:
// CREATE TABLE comments (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   movie_id INT,
//   user_id VARCHAR(20),
//   rating INT,
//   comment TEXT,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );


// ADD COMMENT
app.post('/api/comments/add', async (req, res) => {
  const { movie_id, user_id, rating, comment } = req.body;
  try {
    const conn = await getConnection();
    await conn.execute(
      "INSERT INTO comments (movie_id, user_id, rating, comment) VALUES (?, ?, ?, ?)",
      [movie_id, user_id, rating, comment]
    );
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});


// GET COMMENTS
app.get('/api/comments/:movieId', async (req, res) => {
  const movieId = req.params.movieId;

  try {
    const conn = await getConnection();
    const [rows] = await conn.execute(
      `SELECT comments.*, user.username 
       FROM comments 
       JOIN user ON user.user_ID = comments.user_id 
       WHERE movie_id = ? 
       ORDER BY created_at DESC`,
      [movieId]
    );
    await conn.end();
    res.json(rows);

  } catch (err) {
    console.error(err);
    res.json([]);
  }
});
// ==========================
// TEST DB CONNECTION
// ==========================
async function testDB() {
  try {
    const conn = await getConnection();
    console.log("✅ Connected to MySQL successfully!");
    await conn.end();
  } catch (err) {
    console.error("❌ MySQL connection FAILED:", err.message);
  }
}
testDB();
