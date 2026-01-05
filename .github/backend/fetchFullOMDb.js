const mysql = require('mysql2/promise');

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const DB = {
  host: 'localhost',
  user: 'root',
  password: '11',
  database: 'test'
};

const API_KEY = "87b68abd";

const movies = {
  M001: "Interstellar",
  M002: "Inception",
  M003: "La La Land",
  M004: "The Dark Knight",
  M005: "Dune",
  M006: "Arrival",
  M007: "Whiplash",
  M008: "Gladiator",
  M009: "Parasite",
  M010: "Joker",
  M011: "Stranger Things",
  M012: "The Witcher",
  M013: "Breaking Bad",
  M014: "Game of Thrones",
  M015: "Money Heist",
  M016: "Arcane"
};

async function run() {
  const conn = await mysql.createConnection(DB);

  for (const [id, title] of Object.entries(movies)) {

const url = `http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${API_KEY}&plot=full`;

    console.log(`⏳ Fetching ${title} ...`);

    const res = await fetch(url);
    const data = await res.json();

    if (data.Response === "False") {
      console.log(`❌ OMDb not found: ${title}`);
      continue;
    }

    const poster = data.Poster !== "N/A" ? data.Poster : null;
    const plot = data.Plot !== "N/A" ? data.Plot : null;
    const genre = data.Genre !== "N/A" ? data.Genre : null;
    const actors = data.Actors !== "N/A" ? data.Actors : null;
    const director = data.Director !== "N/A" ? data.Director : null;

    await conn.execute(
      `
      UPDATE Media 
      SET 
        poster=?, 
        backdrop=?, 
        omdb_plot=?, 
        omdb_genre=?, 
        omdb_actors=?, 
        omdb_director=?
      WHERE media_ID=?
      `,
      [poster, poster, plot, genre, actors, director, id]
    );

    console.log(`✔ Updated ${title}`);
  }

  await conn.end();
  console.log("🎉 DONE — Full OMDb data imported!");
}

run();
