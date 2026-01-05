Backend (Node.js + Express + MySQL)
----------------------------------

1. Create a MySQL database (e.g., netflix_demo) or import `database.sql` using DBeaver:
   - Open DBeaver -> New Connection -> MySQL -> connect
   - Right-click connection -> SQL Editor -> Open SQL Script -> load database.sql -> Execute

2. Edit DB config via environment variables or modify backend/server.js DB_CONFIG:
   - DB_HOST, DB_USER, DB_PASS, DB_NAME

3. Install and run:
   cd backend
   npm install
   npm start
cd frontend
npm install
npm run dev
The backend exposes:
- GET /api/media         -> returns list of media
- POST /api/login        -> body: { email, password }