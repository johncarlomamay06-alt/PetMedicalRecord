// Real SQLite Database Manager using sql.js
class DatabaseManager {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.sql = null;
  }

  async init() {
    if (this.isInitialized) return;
    
    try {
      // Load sql.js library
      if (typeof SQL === 'undefined') {
        // Load sql.js from CDN if not already loaded
        await this.loadSQLJS();
      }
      
      // Initialize SQLite database
      this.db = new SQL.Database();
      await this.createTables();
      await this.insertDefaultData();
      this.isInitialized = true;
      console.log('Real SQLite database initialized successfully');
    } catch (error) {
      console.warn('SQLite initialization failed, using local storage only:', error);
      // Fallback to local storage only
      this.isInitialized = true;
    }
  }

  async loadSQLJS() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
      script.onload = () => {
        // Initialize SQL.js
        initSqlJs({
          locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        }).then(SQL => {
          window.SQL = SQL;
          resolve();
        }).catch(reject);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async createTables() {
    if (!this.db) return;

    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'veterinarian',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Pets table
    this.db.exec(`
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
        owner_email TEXT,
        owner_phone TEXT,
        owner_address TEXT,
        registration_date DATE DEFAULT CURRENT_DATE
      )
    `);

    // Medical records table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS medical_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pet_id INTEGER NOT NULL,
        visit_date DATE NOT NULL,
        visit_type TEXT,
        veterinarian TEXT,
        symptoms TEXT,
        diagnosis TEXT,
        treatment TEXT,
        vaccines TEXT,
        notes TEXT,
        weight REAL,
        temperature REAL,
        next_visit DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pet_id) REFERENCES pets (id) ON DELETE CASCADE
      )
    `);
  }

  async insertDefaultData() {
    if (!this.db) return;

    // Insert default admin user if not exists
    const userCheck = this.db.exec("SELECT COUNT(*) as count FROM users WHERE username = 'admin'");
    if (userCheck[0].values[0][0] === 0) {
      this.db.exec(`
        INSERT INTO users (username, password, role) 
        VALUES ('admin', 'password123', 'admin')
      `);
    }
  }

  async login(username, password) {
    if (!this.db) {
      return { success: false, error: 'Database not initialized' };
    }

    try {
      const result = this.db.exec(
        "SELECT id, username, role FROM users WHERE username = ? AND password = ?",
        [username, password]
      );

      if (result.length > 0 && result[0].values.length > 0) {
        const user = result[0].values[0];
        return {
          success: true,
          user: {
            id: user[0],
            username: user[1],
            role: user[2]
          }
        };
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    return { success: false, error: 'Invalid username or password' };
  }

  async getPets() {
    if (!this.db) return [];

    try {
      const result = this.db.exec("SELECT * FROM pets ORDER BY registration_date DESC");
      return result.length > 0 ? result[0].values.map(row => ({
        id: row[0],
        pet_name: row[1],
        species: row[2],
        breed: row[3],
        age: row[4],
        gender: row[5],
        weight: row[6],
        medical_history: row[7],
        owner_name: row[8],
        owner_email: row[9],
        owner_phone: row[10],
        owner_address: row[11],
        registration_date: row[12]
      })) : [];
    } catch (error) {
      console.error('Get pets error:', error);
      return [];
    }
  }

  async createPet(petData) {
    if (!this.db) {
      return { success: false, error: 'Database not initialized' };
    }

    try {
      const result = this.db.exec(`
        INSERT INTO pets (pet_name, species, breed, age, gender, weight, medical_history, 
                         owner_name, owner_email, owner_phone, owner_address, registration_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        petData.pet_name || '',
        petData.species || '',
        petData.breed || '',
        petData.age || 0,
        petData.gender || '',
        petData.weight || 0,
        petData.medical_history || '',
        petData.owner_name || '',
        petData.owner_email || '',
        petData.owner_phone || '',
        petData.owner_address || '',
        petData.registration_date || new Date().toISOString().split('T')[0]
      ]);

      const newId = this.db.exec("SELECT last_insert_rowid() as id")[0].values[0][0];
      return { success: true, id: newId, message: 'Pet registered successfully' };
    } catch (error) {
      console.error('Create pet error:', error);
      return { success: false, error: 'Failed to register pet' };
    }
  }

  async deletePet(petId) {
    if (!this.db) {
      return { success: false, error: 'Database not initialized' };
    }

    try {
      // Delete related medical records first (CASCADE should handle this, but being explicit)
      this.db.exec("DELETE FROM medical_records WHERE pet_id = ?", [petId]);
      
      // Delete the pet
      this.db.exec("DELETE FROM pets WHERE id = ?", [petId]);
      
      return { success: true, message: 'Pet and related records deleted successfully' };
    } catch (error) {
      console.error('Delete pet error:', error);
      return { success: false, error: 'Failed to delete pet' };
    }
  }

  async getMedicalRecords() {
    if (!this.db) return [];

    try {
      const result = this.db.exec(`
        SELECT mr.*, p.pet_name, p.owner_name 
        FROM medical_records mr 
        LEFT JOIN pets p ON mr.pet_id = p.id 
        ORDER BY mr.visit_date DESC
      `);
      
      return result.length > 0 ? result[0].values.map(row => ({
        id: row[0],
        pet_id: row[1],
        visit_date: row[2],
        visit_type: row[3],
        veterinarian: row[4],
        symptoms: row[5],
        diagnosis: row[6],
        treatment: row[7],
        vaccines: row[8],
        notes: row[9],
        weight: row[10],
        temperature: row[11],
        created_at: row[13],
        pet_name: row[14],
        owner_name: row[15]
      })) : [];
    } catch (error) {
      console.error('Get medical records error:', error);
      return [];
    }
  }

  async createMedicalRecord(recordData) {
    if (!this.db) {
      return { success: false, error: 'Database not initialized' };
    }

    try {
      const result = this.db.exec(`
        INSERT INTO medical_records (pet_id, visit_date, visit_type, veterinarian, symptoms, 
                                   diagnosis, treatment, vaccines, notes, weight, temperature)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        recordData.pet_id || 0,
        recordData.visit_date || '',
        recordData.visit_type || '',
        recordData.veterinarian || '',
        recordData.symptoms || '',
        recordData.diagnosis || '',
        recordData.treatment || '',
        recordData.vaccines || '',
        recordData.notes || '',
        recordData.weight || 0,
        recordData.temperature || 0,
      ]);

      const newId = this.db.exec("SELECT last_insert_rowid() as id")[0].values[0][0];
      return { success: true, id: newId, message: 'Medical record saved successfully' };
    } catch (error) {
      console.error('Create medical record error:', error);
      return { success: false, error: 'Failed to save medical record' };
    }
  }

  async getDashboardStats() {
    if (!this.db) {
      return { totalPets: 0, totalOwners: 0, totalVisits: 0, thisMonthVisits: 0 };
    }

    try {
      const totalPets = this.db.exec("SELECT COUNT(*) as count FROM pets")[0].values[0][0];
      const totalOwners = this.db.exec("SELECT COUNT(DISTINCT owner_email) as count FROM pets")[0].values[0][0];
      const totalVisits = this.db.exec("SELECT COUNT(*) as count FROM medical_records")[0].values[0][0];
      
      const currentMonth = new Date().toISOString().substring(0, 7);
      const thisMonthVisits = this.db.exec(`
        SELECT COUNT(*) as count FROM medical_records 
        WHERE strftime('%Y-%m', visit_date) = ?
      `, [currentMonth])[0].values[0][0];

      return {
        totalPets,
        totalOwners,
        totalVisits,
        thisMonthVisits
      };
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return { totalPets: 0, totalOwners: 0, totalVisits: 0, thisMonthVisits: 0 };
    }
  }

  // Export database to file
  exportDatabase() {
    if (!this.db) return null;
    
    const data = this.db.export();
    const blob = new Blob([data], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pet_medical_records.db';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Import database from file
  async importDatabase(file) {
    if (!this.db) return false;
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      this.db = new SQL.Database(uint8Array);
      this.isInitialized = true;
      console.log('Database imported successfully');
      return true;
    } catch (error) {
      console.error('Import database error:', error);
      return false;
    }
  }
}

// Create global database instance
window.database = new DatabaseManager();