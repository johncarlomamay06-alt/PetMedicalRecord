// API Service for Pet Medical Records - HYBRID VERSION (SQLite + Local Storage)
class APIService {
  constructor() {
    this.baseURL = null; // No server needed
    this.database = window.database;
    this.initializeData();
    this.initializeDatabase();
  }

  async initializeDatabase() {
    if (this.database) {
      try {
        await this.database.init();
        console.log('Database initialized successfully');
      } catch (error) {
        console.warn('Database initialization failed, using local storage only:', error);
      }
    }
  }

  // Initialize data from local storage or create default data
  initializeData() {
    // Check if data exists in local storage
    const savedPets = localStorage.getItem('petMedicalRecords_pets');
    const savedRecords = localStorage.getItem('petMedicalRecords_medicalRecords');
    
    if (savedPets && savedRecords) {
      // Load data from local storage and ensure all fields are defined
      const pets = JSON.parse(savedPets);
      const records = JSON.parse(savedRecords);
      
      // Ensure all pet fields are defined
      this.mockData = {
        pets: pets.map(pet => ({
          id: pet.id || 0,
          pet_name: pet.pet_name || 'Unknown Pet',
          species: pet.species || 'Unknown',
          breed: pet.breed || '',
          age: pet.age || 0,
          gender: pet.gender || '',
          weight: pet.weight || 0,
          medical_history: pet.medical_history || '',
          owner_name: pet.owner_name || 'Unknown Owner',
          owner_email: pet.owner_email || '',
          owner_phone: pet.owner_phone || '',
          owner_address: pet.owner_address || '',
          registration_date: pet.registration_date || new Date().toISOString().split('T')[0]
        })),
        medicalRecords: records.map(record => ({
          id: record.id || 0,
          pet_id: record.pet_id || 0,
          pet_name: record.pet_name || 'Unknown Pet',
          owner_name: record.owner_name || 'Unknown Owner',
          visit_date: record.visit_date || new Date().toISOString().split('T')[0],
          visit_type: record.visit_type || '',
          veterinarian: record.veterinarian || '',
          symptoms: record.symptoms || '',
          diagnosis: record.diagnosis || '',
          treatment: record.treatment || '',
          vaccines: record.vaccines || '',
          notes: record.notes || '',
          weight: record.weight || 0,
          temperature: record.temperature || 0,
          created_at: record.created_at || new Date().toISOString()
        }))
      };
    } else {
      // Create default data and save to local storage
      this.mockData = {
        pets: [
          {
            id: 1,
            pet_name: 'Buddy',
            species: 'Dog',
            breed: 'Golden Retriever',
            age: 3,
            gender: 'Male',
            weight: 25.5,
            medical_history: 'Healthy, no known issues',
            owner_name: 'John Doe',
            owner_email: 'john@example.com',
            owner_phone: '555-0123',
            owner_address: '123 Main St',
            registration_date: '2024-01-15'
          },
          {
            id: 2,
            pet_name: 'Whiskers',
            species: 'Cat',
            breed: 'Persian',
            age: 2,
            gender: 'Female',
            weight: 4.2,
            medical_history: 'Allergic to fish',
            owner_name: 'Jane Smith',
            owner_email: 'jane@example.com',
            owner_phone: '555-0456',
            owner_address: '456 Oak Ave',
            registration_date: '2024-02-10'
          }
        ],
        medicalRecords: [
          {
            id: 1,
            pet_id: 1,
            pet_name: 'Buddy',
            owner_name: 'John Doe',
            visit_date: '2024-01-20',
            visit_type: 'Routine Checkup',
            veterinarian: 'Dr. Mamay',
            symptoms: 'None',
            diagnosis: 'Healthy',
            treatment: 'Annual vaccination',
            vaccines: 'Rabies, DHPP',
            notes: 'Pet is in excellent health',
            weight: 25.5,
            temperature: 101.2,
            created_at: '2024-01-20'
          },
          {
            id: 2,
            pet_id: 2,
            pet_name: 'Whiskers',
            owner_name: 'Jane Smith',
            visit_date: '2024-02-15',
            visit_type: 'Sick Visit',
            veterinarian: 'Dr. Mamay',
            symptoms: 'Sneezing, watery eyes',
            diagnosis: 'Allergic reaction',
            treatment: 'Antihistamine',
            vaccines: 'None',
            notes: 'Avoid fish-based foods',
            weight: 4.2,
            temperature: 100.8,
            created_at: '2024-02-15'
          }
        ]
      };
      
      // Save initial data to local storage
      this.saveToLocalStorage();
    }
  }

  // Save data to local storage
  saveToLocalStorage() {
    localStorage.setItem('petMedicalRecords_pets', JSON.stringify(this.mockData.pets));
    localStorage.setItem('petMedicalRecords_medicalRecords', JSON.stringify(this.mockData.medicalRecords));
  }

  // Authentication - HYBRID VERSION
  async login(username, password) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Try SQLite database first
    if (this.database && this.database.isInitialized) {
      try {
        const result = await this.database.login(username, password);
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.warn('SQLite login failed, falling back to local storage:', error);
      }
    }
    
    // Fallback to local storage authentication
    if (username === 'admin' && password === 'password123') {
      return { 
        success: true, 
        user: { 
          username: 'admin', 
          id: 1 
        } 
      };
    } else {
      return { 
        success: false, 
        error: 'Invalid username or password' 
      };
    }
  }

  // Pets API - HYBRID VERSION
  async getPets() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Try SQLite database first
    if (this.database && this.database.isInitialized) {
      try {
        const pets = await this.database.getPets();
        if (pets && pets.length > 0) {
          return pets;
        }
      } catch (error) {
        console.warn('SQLite getPets failed, falling back to local storage:', error);
      }
    }
    
    // Fallback to local storage
    return this.mockData.pets;
  }

  async createPet(petData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Try SQLite database first
    if (this.database && this.database.isInitialized) {
      try {
        const result = await this.database.createPet(petData);
        if (result.id > 0) {
          return { success: true, data: result };
        }
      } catch (error) {
        console.warn('SQLite createPet failed, falling back to local storage:', error);
      }
    }
    
    // Fallback to local storage
    const newId = Math.max(...this.mockData.pets.map(p => p.id), 0) + 1;
    
    const newPet = {
      id: newId,
      pet_name: petData.pet_name || petData.petName || 'Unknown Pet',
      species: petData.species || 'Unknown',
      breed: petData.breed || '',
      age: petData.age || 0,
      gender: petData.gender || '',
      weight: petData.weight || 0,
      medical_history: petData.medical_history || petData.medicalHistory || '',
      owner_name: petData.owner_name || petData.ownerName || 'Unknown Owner',
      owner_email: petData.owner_email || petData.ownerEmail || '',
      owner_phone: petData.owner_phone || petData.ownerPhone || '',
      owner_address: petData.owner_address || petData.ownerAddress || '',
      registration_date: new Date().toISOString().split('T')[0]
    };
    
    this.mockData.pets.push(newPet);
    this.saveToLocalStorage();
    
    return { 
      success: true, 
      data: { 
        id: newId, 
        message: 'Pet registered successfully' 
      } 
    };
  }

  async deletePet(petId) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Try SQLite database first
    if (this.database && this.database.isInitialized) {
      try {
        const result = await this.database.deletePet(petId);
        return { success: true, data: result };
      } catch (error) {
        console.warn('SQLite deletePet failed, falling back to local storage:', error);
      }
    }
    
    // Fallback to local storage
    this.mockData.pets = this.mockData.pets.filter(pet => pet.id !== parseInt(petId));
    this.mockData.medicalRecords = this.mockData.medicalRecords.filter(record => record.pet_id !== parseInt(petId));
    this.saveToLocalStorage();
    
    return { 
      success: true, 
      data: { 
        message: 'Pet and related records deleted successfully' 
      } 
    };
  }

  // Medical Records API - HYBRID VERSION
  async getMedicalRecords() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Try SQLite database first
    if (this.database && this.database.isInitialized) {
      try {
        const records = await this.database.getMedicalRecords();
        if (records && records.length > 0) {
          return records;
        }
      } catch (error) {
        console.warn('SQLite getMedicalRecords failed, falling back to local storage:', error);
      }
    }
    
    // Fallback to local storage
    return this.mockData.medicalRecords;
  }

  async createMedicalRecord(recordData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Try SQLite database first
    if (this.database && this.database.isInitialized) {
      try {
        const result = await this.database.createMedicalRecord(recordData);
        if (result.id > 0) {
          return { success: true, data: result };
        }
      } catch (error) {
        console.warn('SQLite createMedicalRecord failed, falling back to local storage:', error);
      }
    }
    
    // Fallback to local storage
    const newId = Math.max(...this.mockData.medicalRecords.map(r => r.id), 0) + 1;
    const pet = this.mockData.pets.find(p => p.id === recordData.pet_id);
    
    const newRecord = {
      id: newId,
      pet_id: recordData.pet_id || 0,
      pet_name: pet ? pet.pet_name : 'Unknown Pet',
      owner_name: pet ? pet.owner_name : 'Unknown Owner',
      visit_date: recordData.visit_date || recordData.visitDate || new Date().toISOString().split('T')[0],
      visit_type: recordData.visit_type || recordData.visitType || '',
      veterinarian: recordData.veterinarian || '',
      symptoms: recordData.symptoms || '',
      diagnosis: recordData.diagnosis || '',
      treatment: recordData.treatment || '',
      vaccines: recordData.vaccines || '',
      notes: recordData.notes || '',
      weight: recordData.weight || 0,
      temperature: recordData.temperature || 0,
      created_at: new Date().toISOString()
    };
    
    this.mockData.medicalRecords.push(newRecord);
    this.saveToLocalStorage();
    
    return { 
      success: true, 
      data: { 
        id: newId, 
        message: 'Medical record saved successfully' 
      } 
    };
  }

  // Dashboard Statistics - HYBRID VERSION
  async getDashboardStats() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Try SQLite database first
    if (this.database && this.database.isInitialized) {
      try {
        const stats = await this.database.getDashboardStats();
        if (stats.totalPets > 0 || stats.totalVisits > 0) {
          return stats;
        }
      } catch (error) {
        console.warn('SQLite getDashboardStats failed, falling back to local storage:', error);
      }
    }
    
    // Fallback to local storage
    const totalPets = this.mockData.pets ? this.mockData.pets.length : 0;
    const totalOwners = this.mockData.pets ? new Set(this.mockData.pets.map(pet => pet.owner_email || 'unknown')).size : 0;
    const totalVisits = this.mockData.medicalRecords ? this.mockData.medicalRecords.length : 0;
    
    const currentMonth = new Date().toISOString().substring(0, 7);
    const thisMonthVisits = this.mockData.medicalRecords ? this.mockData.medicalRecords.filter(record => 
      record.visit_date && record.visit_date.startsWith(currentMonth)
    ).length : 0;
    
    return {
      totalPets: totalPets || 0,
      totalOwners: totalOwners || 0,
      totalVisits: totalVisits || 0,
      thisMonthVisits: thisMonthVisits || 0
    };
  }
}

// Create global API instance
window.api = new APIService();
