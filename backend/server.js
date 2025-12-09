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
  try {
    const conn = await getConnection();

    const [rows] = await conn.execute(`
      SELECT 
        m.media_ID,
        m.title,
        m.description,
        m.release_date,
        m.type,
        CONCAT('https://picsum.photos/seed/', m.media_ID, '/500/750') AS poster,
        CONCAT('https://picsum.photos/seed/', m.media_ID, '/1280/720') AS backdrop
      FROM Media m
      ORDER BY m.release_date DESC;
    `);

    await conn.end();
    res.json(rows);

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
;


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

  } catch (err) {db
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
