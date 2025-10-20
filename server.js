const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Initialize SQLite Database
const db = new sqlite3.Database('./pet_medical_records.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'veterinarian',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Pets table
  db.run(`
    CREATE TABLE IF NOT EXISTS pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_name TEXT NOT NULL,
      species TEXT NOT NULL,
      breed TEXT,
      age INTEGER,
      gender TEXT,
      weight REAL,
      medical_history TEXT,
      owner_name TEXT NOT NULL,
      owner_email TEXT NOT NULL,
      owner_phone TEXT,
      owner_address TEXT,
      registration_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Medical records table
  db.run(`
    CREATE TABLE IF NOT EXISTS medical_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER NOT NULL,
      visit_date DATE NOT NULL,
      visit_type TEXT,
      veterinarian TEXT NOT NULL,
      symptoms TEXT,
      diagnosis TEXT NOT NULL,
      treatment TEXT,
      vaccines TEXT,
      notes TEXT,
      weight REAL,
      temperature REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pet_id) REFERENCES pets (id)
    )
  `);

  // Insert default admin user
  db.get("SELECT COUNT(*) as count FROM users WHERE username = 'admin'", (err, row) => {
    if (err) {
      console.error('Error checking admin user:', err.message);
    } else if (row.count === 0) {
      db.run("INSERT INTO users (username, password) VALUES ('admin', 'password123')", (err) => {
        if (err) {
          console.error('Error creating admin user:', err.message);
        } else {
          console.log('Default admin user created');
        }
      });
    }
  });
}

// Authentication middleware
function authenticateUser(req, res, next) {
  const { username, password } = req.body;
  
  db.get(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else if (row) {
        req.user = row;
        next();
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    }
  );
}

// API Routes

// Authentication
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else if (row) {
        res.json({ 
          success: true, 
          user: { 
            id: row.id, 
            username: row.username, 
            role: row.role 
          } 
        });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    }
  );
});

// Pets API
app.get('/api/pets', (req, res) => {
  db.all("SELECT * FROM pets ORDER BY registration_date DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/pets', (req, res) => {
  const {
    pet_name, species, breed, age, gender, weight, medical_history,
    owner_name, owner_email, owner_phone, owner_address
  } = req.body;

  db.run(
    `INSERT INTO pets (pet_name, species, breed, age, gender, weight, medical_history, 
     owner_name, owner_email, owner_phone, owner_address) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [pet_name, species, breed, age, gender, weight, medical_history,
     owner_name, owner_email, owner_phone, owner_address],
    function(err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json({ id: this.lastID, message: 'Pet registered successfully' });
      }
    }
  );
});

app.delete('/api/pets/:id', (req, res) => {
  const petId = req.params.id;
  
  // First delete related medical records
  db.run("DELETE FROM medical_records WHERE pet_id = ?", [petId], (err) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }
    
    // Then delete the pet
    db.run("DELETE FROM pets WHERE id = ?", [petId], function(err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json({ message: 'Pet and related records deleted successfully' });
      }
    });
  });
});

// Medical Records API
app.get('/api/medical-records', (req, res) => {
  db.all(`
    SELECT mr.*, p.pet_name, p.owner_name 
    FROM medical_records mr 
    JOIN pets p ON mr.pet_id = p.id 
    ORDER BY mr.visit_date DESC
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/medical-records', (req, res) => {
  const {
    pet_id, visit_date, visit_type, veterinarian, symptoms, diagnosis,
    treatment, vaccines, notes, weight, temperature
  } = req.body;

  db.run(
    `INSERT INTO medical_records (pet_id, visit_date, visit_type, veterinarian, 
     symptoms, diagnosis, treatment, vaccines, notes, weight, temperature) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [pet_id, visit_date, visit_type, veterinarian, symptoms, diagnosis,
     treatment, vaccines, notes, weight, temperature],
    function(err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json({ id: this.lastID, message: 'Medical record saved successfully' });
      }
    }
  );
});

// Dashboard statistics
app.get('/api/dashboard/stats', (req, res) => {
  const stats = {};
  
  // Get total pets
  db.get("SELECT COUNT(*) as count FROM pets", (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }
    stats.totalPets = row.count;
    
    // Get unique owners
    db.get("SELECT COUNT(DISTINCT owner_email) as count FROM pets", (err, row) => {
      if (err) {
        res.status(500).json({ error: 'Database error' });
        return;
      }
      stats.totalOwners = row.count;
      
      // Get total visits
      db.get("SELECT COUNT(*) as count FROM medical_records", (err, row) => {
        if (err) {
          res.status(500).json({ error: 'Database error' });
          return;
        }
        stats.totalVisits = row.count;
        
        // Get this month's visits
        db.get(`
          SELECT COUNT(*) as count FROM medical_records 
          WHERE strftime('%Y-%m', visit_date) = strftime('%Y-%m', 'now')
        `, (err, row) => {
          if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
          }
          stats.thisMonthVisits = row.count;
          
          res.json(stats);
        });
      });
    });
  });
});

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Database: SQLite (pet_medical_records.db)');
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});
