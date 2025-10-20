// Medical records functionality
window.medicalRecords = {
  init() {
    this.renderForm()
  },

  async renderForm() {
    const container = document.getElementById("medicalRecordsContainer")
    if (!container) return

    // Show loading state
    container.innerHTML = '<div class="loading">Loading form...</div>'

    try {
      const pets = await window.api.getPets()

    container.innerHTML = `
            <div class="form-container">
                <h1 class="form-title">Medical Records</h1>
                
                <form id="medicalRecordsForm">
                    <div class="form-section">
                        <h3 class="section-title-form">Visit Information</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="petSelect">Select Pet *</label>
                                <select id="petSelect" name="petId" required>
                                    <option value="">Choose a pet</option>
                                    ${pets
                                      .map(
                                        (pet) => `
                                        <option value="${pet.id}">${pet.pet_name} (${pet.species})</option>
                                    `,
                                      )
                                      .join("")}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="visitDate">Visit Date *</label>
                                <input type="date" id="visitDate" name="visitDate" required>
                            </div>
                            <div class="form-group">
                                <label for="visitType">Visit Type</label>
                                <select id="visitType" name="visitType">
                                    <option value="">Select Type</option>
                                    <option value="routine">Routine Checkup</option>
                                    <option value="vaccination">Vaccination</option>
                                    <option value="emergency">Emergency</option>
                                    <option value="surgery">Surgery</option>
                                    <option value="follow-up">Follow-up</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="veterinarian">Veterinarian *</label>
                                <input type="text" id="veterinarian" name="veterinarian" required placeholder="Enter veterinarian name">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3 class="section-title-form">Medical Details</h3>
                        <div class="form-group">
                            <label for="symptoms">Symptoms/Reason for Visit</label>
                            <textarea id="symptoms" name="symptoms" placeholder="Describe the symptoms or reason for the visit..."></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="diagnosis">Diagnosis *</label>
                            <textarea id="diagnosis" name="diagnosis" required placeholder="Enter the diagnosis..."></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="treatment">Treatment/Prescription</label>
                            <textarea id="treatment" name="treatment" placeholder="Describe the treatment plan and any prescriptions..."></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="vaccines">Vaccines Administered</label>
                            <input type="text" id="vaccines" name="vaccines" placeholder="List any vaccines given">
                        </div>
                        
                        <div class="form-group">
                            <label for="notes">Additional Notes</label>
                            <textarea id="notes" name="notes" placeholder="Any additional observations or notes..."></textarea>
                        </div>
                        
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="weight">Current Weight (kg)</label>
                                <input type="number" id="weight" name="weight" step="0.1" min="0">
                            </div>
                            <div class="form-group">
                                <label for="temperature">Temperature (°C)</label>
                                <input type="number" id="temperature" name="temperature" step="0.1">
                            </div>
                            <div class="form-group">
                                <label for="nextVisit">Next Visit Date</label>
                                <input type="date" id="nextVisit" name="nextVisit">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('form').reset()">Clear Form</button>
                        <button type="submit" class="btn btn-primary">
                            <span>Save</span>
                        </button>
                    </div>
                </form>
            </div>
        `

      this.setupForm()
    } catch (error) {
      console.error('Error loading medical records form:', error)
      container.innerHTML = '<div class="error">Error loading form. Please try again.</div>'
    }
  },

  setupForm() {
    const form = document.getElementById("medicalRecordsForm")
    const petSelect = document.getElementById("petSelect")

    // Set default date to today
    document.getElementById("visitDate").value = new Date().toISOString().split("T")[0]

    // Auto-populate pet info when selected
    petSelect.addEventListener("change", this.handlePetSelection.bind(this))

    form.addEventListener("submit", this.handleSubmit.bind(this))
  },

  async handlePetSelection(e) {
    const petId = e.target.value
    if (!petId) return

    try {
      const pets = await window.api.getPets()
      const selectedPet = pets.find((pet) => pet.id == petId)

      if (selectedPet && selectedPet.weight) {
        document.getElementById("weight").value = selectedPet.weight
      }
    } catch (error) {
      console.error('Error loading pet data:', error)
    }
  },

  async handleSubmit(e) {
    e.preventDefault()

    const formData = new FormData(e.target)
    const recordData = Object.fromEntries(formData.entries())

    // Convert empty strings to null for optional fields
    Object.keys(recordData).forEach(key => {
      if (recordData[key] === '') {
        recordData[key] = null
      }
    })

    // Convert petId to integer
    recordData.pet_id = parseInt(recordData.petId)

    try {
      const result = await window.api.createMedicalRecord(recordData)
      
      if (result.success) {
        alert("Medical record saved successfully!")
        e.target.reset()
        document.getElementById("visitDate").value = new Date().toISOString().split("T")[0]
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert("Network error. Please check if the server is running.")
    }
  },
}
