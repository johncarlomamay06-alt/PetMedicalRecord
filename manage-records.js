// Manage records functionality
window.manageRecords = {
  async init() {
    await this.renderTable()
  },

  async renderTable() {
    const container = document.getElementById("manageRecordsContainer")
    if (!container) return

    // Show loading state
    container.innerHTML = '<div class="loading">Loading records...</div>'

    try {
      const [pets, records] = await Promise.all([
        window.api.getPets(),
        window.api.getMedicalRecords()
      ])

    container.innerHTML = `
            <div class="table-container">
                <div class="table-header">
                    <h1 class="section-title">Manage Pet Records</h1>
                    <div class="search-filters">
                        <input type="text" id="searchInput" class="search-input" placeholder="Search pets...">
                        <select id="speciesFilter" class="filter-select">
                            <option value="">All Species</option>
                            <option value="dog">Dog</option>
                            <option value="cat">Cat</option>
                        </select>
                    </div>
                </div>
                
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Pet Name</th>
                            <th>Species</th>
                            <th>Owner</th>
                            <th>Last Visit</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="petsTableBody">
                        ${this.renderTableRows(pets, records)}
                    </tbody>
                </table>
            </div>
        `

      this.setupFilters()
    } catch (error) {
      console.error('Error loading manage records:', error)
      container.innerHTML = '<div class="error">Error loading records. Please try again.</div>'
    }
  },

  renderTableRows(pets, records) {
    if (pets.length === 0) {
      return '<tr><td colspan="5" class="text-center">No pets registered</td></tr>'
    }

    return pets
      .map((pet) => {
        const petRecords = records.filter((record) => record.pet_id === pet.id)
        const lastVisit =
          petRecords.length > 0
            ? new Date(Math.max(...petRecords.map((r) => new Date(r.visit_date)))).toLocaleDateString()
            : "No visits"

        return `
                <tr>
                    <td>${pet.pet_name}</td>
                    <td>${pet.species}</td>
                    <td>${pet.owner_name}</td>
                    <td>${lastVisit}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-primary" onclick="manageRecords.viewRecord('${pet.id}')">View</button>
                            <button class="btn btn-sm btn-secondary" onclick="manageRecords.printRecord('${pet.id}')">Print</button>
                            <button class="btn btn-sm btn-danger" onclick="manageRecords.deleteRecord('${pet.id}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `
      })
      .join("")
  },

  setupFilters() {
    const searchInput = document.getElementById("searchInput")
    const speciesFilter = document.getElementById("speciesFilter")

    searchInput.addEventListener("input", this.filterTable.bind(this))
    speciesFilter.addEventListener("change", this.filterTable.bind(this))
  },

  async filterTable() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase()
    const speciesFilter = document.getElementById("speciesFilter").value

    try {
      const [pets, records] = await Promise.all([
        window.api.getPets(),
        window.api.getMedicalRecords()
      ])

      const filteredPets = pets.filter((pet) => {
        const matchesSearch =
          pet.pet_name.toLowerCase().includes(searchTerm) || pet.owner_name.toLowerCase().includes(searchTerm)
        const matchesSpecies = !speciesFilter || pet.species === speciesFilter

        return matchesSearch && matchesSpecies
      })

      document.getElementById("petsTableBody").innerHTML = this.renderTableRows(filteredPets, records)
    } catch (error) {
      console.error('Error filtering table:', error)
    }
  },

  async viewRecord(petId) {
    try {
      const [pets, records] = await Promise.all([
        window.api.getPets(),
        window.api.getMedicalRecords()
      ])
      
      const pet = pets.find((p) => p.id == petId)
      const petRecords = records.filter((r) => r.pet_id == petId)

    if (!pet) return

    const modalContent = `
            <div class="modal-header">
                <h2 class="modal-title">Pet Record: ${pet.petName}</h2>
                <button class="modal-close" onclick="this.closest('.modal-overlay').classList.add('hidden')">&times;</button>
            </div>
            <div class="modal-body">
                <div class="record-detail">
                    <h4>Pet Information</h4>
                    <p><strong>Name:</strong> ${pet.pet_name}</p>
                    <p><strong>Species:</strong> ${pet.species}</p>
                    <p><strong>Breed:</strong> ${pet.breed || "Not specified"}</p>
                    <p><strong>Age:</strong> ${pet.age || "Not specified"}</p>
                    <p><strong>Gender:</strong> ${pet.gender || "Not specified"}</p>
                    <p><strong>Weight:</strong> ${pet.weight || "Not specified"} kg</p>
                </div>
                
                <div class="record-detail">
                    <h4>Owner Information</h4>
                    <p><strong>Name:</strong> ${pet.owner_name}</p>
                    <p><strong>Email:</strong> ${pet.owner_email}</p>
                    <p><strong>Phone:</strong> ${pet.owner_phone || "Not provided"}</p>
                    <p><strong>Address:</strong> ${pet.owner_address || "Not provided"}</p>
                </div>
                
                <div class="record-detail">
                    <h4>Medical History</h4>
                    ${pet.medical_history ? `<p>${pet.medical_history}</p>` : "<p>No medical history recorded</p>"}
                </div>
                
                <div class="record-detail">
                    <h4>Visit History (${petRecords.length} visits)</h4>
                    ${
                      petRecords.length > 0
                        ? petRecords
                            .map(
                              (record) => `
                        <div style="border: 1px solid #e5e7eb; padding: 1rem; margin-bottom: 1rem; border-radius: 6px;">
                            <p><strong>Date:</strong> ${new Date(record.visit_date).toLocaleDateString()}</p>
                            <p><strong>Veterinarian:</strong> ${record.veterinarian}</p>
                            <p><strong>Type:</strong> ${record.visit_type || "Not specified"}</p>
                            <p><strong>Diagnosis:</strong> ${record.diagnosis}</p>
                            ${record.treatment ? `<p><strong>Treatment:</strong> ${record.treatment}</p>` : ""}
                            ${record.vaccines ? `<p><strong>Vaccines:</strong> ${record.vaccines}</p>` : ""}
                            ${record.notes ? `<p><strong>Notes:</strong> ${record.notes}</p>` : ""}
                        </div>
                    `,
                            )
                            .join("")
                        : "<p>No visits recorded</p>"
                    }
                </div>
            </div>
        `

      document.getElementById("modalContent").innerHTML = modalContent
      document.getElementById("modalOverlay").classList.remove("hidden")
    } catch (error) {
      console.error('Error loading pet record:', error)
      alert('Error loading pet record. Please try again.')
    }
  },

  async printRecord(petId) {
    try {
      const [pets, medicalRecords] = await Promise.all([
        window.api.getPets(),
        window.api.getMedicalRecords()
      ])
      
      const pet = pets.find((p) => p.id == petId)
      if (!pet) {
        alert('Pet record not found')
        return
      }

      // Get medical records for this pet
      const petMedicalRecords = medicalRecords.filter(record => record.pet_id == petId)
      
      // Format medical records for display
      const medicalRecordsHTML = petMedicalRecords.length > 0 
        ? petMedicalRecords.map(record => `
            <div class="medical-record">
              <div class="record-header">
                <h4>Visit on ${new Date(record.visit_date).toLocaleDateString()}</h4>
                <span class="visit-type">${record.visit_type || 'General Checkup'}</span>
              </div>
              <div class="record-details">
                <div class="record-row">
                  <strong>Veterinarian:</strong> ${record.veterinarian || 'Not specified'}
                </div>
                <div class="record-row">
                  <strong>Symptoms:</strong> ${record.symptoms || 'None reported'}
                </div>
                <div class="record-row">
                  <strong>Diagnosis:</strong> ${record.diagnosis || 'No diagnosis recorded'}
                </div>
                <div class="record-row">
                  <strong>Treatment:</strong> ${record.treatment || 'No treatment recorded'}
                </div>
                <div class="record-row">
                  <strong>Vaccines:</strong> ${record.vaccines || 'No vaccines administered'}
                </div>
                <div class="record-row">
                  <strong>Weight:</strong> ${record.weight ? record.weight + ' kg' : 'Not recorded'}
                </div>
                <div class="record-row">
                  <strong>Temperature:</strong> ${record.temperature ? record.temperature + '°C' : 'Not recorded'}
                </div>
                <div class="record-row">
                  <strong>Notes:</strong> ${record.notes || 'No additional notes'}
                </div>
              </div>
            </div>
          `).join('')
        : '<p class="no-records">No medical records found for this pet.</p>'

      // Create print window
      const printWindow = window.open("", "_blank")
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Pet Medical Record - ${pet.pet_name}</title>
            <meta charset="UTF-8">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background: white;
                padding: 20px;
              }
              
              .header {
                text-align: center;
                border-bottom: 3px solid #667eea;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              
              .header h1 {
                color: #667eea;
                font-size: 2.5em;
                margin-bottom: 10px;
              }
              
              .header .subtitle {
                color: #666;
                font-size: 1.2em;
              }
              
              .section {
                margin-bottom: 30px;
                page-break-inside: avoid;
              }
              
              .section h2 {
                color: #667eea;
                font-size: 1.5em;
                margin-bottom: 15px;
                padding-bottom: 5px;
                border-bottom: 2px solid #e5e7eb;
              }
              
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-bottom: 20px;
              }
              
              .info-item {
                padding: 10px;
                background: #f8fafc;
                border-radius: 5px;
                border-left: 4px solid #667eea;
              }
              
              .info-item strong {
                color: #374151;
                display: block;
                margin-bottom: 5px;
                font-size: 0.9em;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              
              .info-item span {
                color: #1f2937;
                font-size: 1.1em;
              }
              
              .medical-record {
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                margin-bottom: 20px;
                padding: 20px;
                background: #fafafa;
                page-break-inside: avoid;
              }
              
              .record-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #d1d5db;
              }
              
              .record-header h4 {
                color: #1f2937;
                font-size: 1.2em;
              }
              
              .visit-type {
                background: #667eea;
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.8em;
                font-weight: 600;
              }
              
              .record-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
              }
              
              .record-row {
                padding: 8px 0;
                border-bottom: 1px solid #f3f4f6;
              }
              
              .record-row:last-child {
                border-bottom: none;
              }
              
              .record-row strong {
                color: #374151;
                display: inline-block;
                min-width: 120px;
                font-size: 0.9em;
              }
              
              .no-records {
                text-align: center;
                color: #6b7280;
                font-style: italic;
                padding: 40px;
                background: #f9fafb;
                border-radius: 8px;
              }
              
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 2px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 0.9em;
              }
              
              @media print {
                body { padding: 0; }
                .section { page-break-inside: avoid; }
                .medical-record { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Pet Medical Record</h1>
              <p class="subtitle">Comprehensive Medical History Report</p>
            </div>
            
            <div class="section">
              <h2>Pet Information</h2>
              <div class="info-grid">
                <div class="info-item">
                  <strong>Pet Name</strong>
                  <span>${pet.pet_name}</span>
                </div>
                <div class="info-item">
                  <strong>Species</strong>
                  <span>${pet.species}</span>
                </div>
                <div class="info-item">
                  <strong>Breed</strong>
                  <span>${pet.breed || 'Not specified'}</span>
                </div>
                <div class="info-item">
                  <strong>Age</strong>
                  <span>${pet.age ? pet.age + ' years' : 'Not specified'}</span>
                </div>
                <div class="info-item">
                  <strong>Gender</strong>
                  <span>${pet.gender || 'Not specified'}</span>
                </div>
                <div class="info-item">
                  <strong>Weight</strong>
                  <span>${pet.weight ? pet.weight + ' kg' : 'Not specified'}</span>
                </div>
                <div class="info-item">
                  <strong>Registration Date</strong>
                  <span>${new Date(pet.registration_date).toLocaleDateString()}</span>
                </div>
                <div class="info-item">
                  <strong>Medical History</strong>
                  <span>${pet.medical_history || 'No medical history recorded'}</span>
                </div>
              </div>
            </div>
            
            <div class="section">
              <h2>Owner Information</h2>
              <div class="info-grid">
                <div class="info-item">
                  <strong>Owner Name</strong>
                  <span>${pet.owner_name}</span>
                </div>
                <div class="info-item">
                  <strong>Email</strong>
                  <span>${pet.owner_email || 'Not provided'}</span>
                </div>
                <div class="info-item">
                  <strong>Phone</strong>
                  <span>${pet.owner_phone || 'Not provided'}</span>
                </div>
                <div class="info-item">
                  <strong>Address</strong>
                  <span>${pet.owner_address || 'Not provided'}</span>
                </div>
              </div>
            </div>
            
            <div class="section">
              <h2>Medical Records (${petMedicalRecords.length} visits)</h2>
              ${medicalRecordsHTML}
            </div>
            
            <div class="footer">
              <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
              <p>Pet Medical Records System</p>
            </div>
          </body>
        </html>
      `)
      
      printWindow.document.close()
      
      // Wait for content to load before printing
      printWindow.onload = function() {
        printWindow.focus()
        printWindow.print()
      }
      
    } catch (error) {
      console.error('Error printing record:', error)
      alert('Error loading record for printing. Please try again.')
    }
  },

  exportRecord(petId) {
    const pets = this.getPets()
    const records = this.getRecords()
    const pet = pets.find((p) => p.id === petId)
    const petRecords = records.filter((r) => r.petId === petId)

    if (!pet) return

    const exportData = {
      pet: pet,
      medicalRecords: petRecords,
      exportDate: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(dataBlob)
    link.download = `${pet.petName}_medical_record.json`
    link.click()
  },

  async deleteRecord(petId) {
    if (!confirm("Are you sure you want to delete this pet record? This action cannot be undone.")) {
      return
    }

    try {
      const result = await window.api.deletePet(petId)
      
      if (result.success) {
        alert("Pet record deleted successfully")
        // Refresh table
        await this.renderTable()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert("Network error. Please check if the server is running.")
    }
  },
}

// Close modal when clicking overlay
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.add("hidden")
  }
})
