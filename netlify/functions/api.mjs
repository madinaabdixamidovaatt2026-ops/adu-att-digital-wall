import mysql from "mysql2/promise";

export default async (req) => {
  let db;
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 4000),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
    });

    if (req.method === "POST") {
      const { name } = await req.json();
      const clean = String(name ?? "").trim().slice(0, 100);
      if (clean) {
        await db.execute("INSERT INTO notes (name) VALUES (?)", [clean]);
      }
    } else if (req.method === "DELETE") {
      const id = Number(new URL(req.url).searchParams.get("id"));
      if (!Number.isInteger(id) || id <= 0) {
        return Response.json({ error: "Noto‘g‘ri ID" }, { status: 400 });
      }
      await db.execute("DELETE FROM notes WHERE id = ?", [id]);
    } else if (req.method !== "GET") {
      return Response.json({ error: "Ruxsat etilmagan so‘rov" }, { status: 405 });
    }

    const [rows] = await db.execute(
      "SELECT id, name, created_at FROM notes ORDER BY id DESC LIMIT 500"
    );
    return Response.json(rows);
  } catch (err) {
    console.error("Database function error:", err);
    return Response.json({ error: "Server xatosi" }, { status: 500 });
  } finally {
    if (db) await db.end();
  }
};
