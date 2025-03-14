const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");

// Initialize Express app
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

// Connect to SQLite database (or create if not exists)
const db = new sqlite3.Database("database.db", (err) => {
    if (err) {
        console.error("Error connecting to database:", err.message);
    } else {
        console.log("Connected to SQLite database.");

        // Create the "architectures" table if it doesn't exist
        db.run(
            `CREATE TABLE IF NOT EXISTS architectures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        architecture_image TEXT NOT NULL,
        architecture_name TEXT NOT NULL,
        description TEXT NOT NULL
      )`,
            (err) => {
                if (err) {
                    console.error("Error creating table:", err.message);
                } else {
                    console.log("Table 'architectures' is ready.");
                }
            }
        );
    }
});

// CRUD Endpoints

// Create (POST) - Add new architecture
app.post("/architectures", (req, res) => {
    const { architecture_image, architecture_name, description } = req.body;
    if (!architecture_image || !architecture_name || !description) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const sql = `INSERT INTO architectures (architecture_image, architecture_name, description) VALUES (?, ?, ?)`;
    db.run(sql, [architecture_image, architecture_name, description], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, architecture_image, architecture_name, description });
    });
});

// Read (GET) - Get all architectures
app.get("/architectures", (req, res) => {
    db.all("SELECT * FROM architectures", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Read (GET) - Get architecture by ID
app.get("/architectures/:id", (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM architectures WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        row ? res.json(row) : res.status(404).json({ error: "Architecture not found" });
    });
});

// Update (PUT) - Update architecture by ID
app.put("/architectures/:id", (req, res) => {
    const { id } = req.params;
    const { architecture_image, architecture_name, description } = req.body;
    if (!architecture_image || !architecture_name || !description) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const sql = `UPDATE architectures SET architecture_image = ?, architecture_name = ?, description = ? WHERE id = ?`;
    db.run(sql, [architecture_image, architecture_name, description, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        this.changes
            ? res.json({ id, architecture_image, architecture_name, description })
            : res.status(404).json({ error: "Architecture not found" });
    });
});

// Delete (DELETE) - Remove architecture by ID
app.delete("/architectures/:id", (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM architectures WHERE id = ?", [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        this.changes ? res.json({ message: "Deleted successfully" }) : res.status(404).json({ error: "Architecture not found" });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
