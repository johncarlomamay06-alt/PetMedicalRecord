// Pet registration functionality
window.petRegistration = {
  init() {
    this.renderForm()
  },

  renderForm() {
    const container = document.getElementById("petRegistrationContainer")
    if (!container) return

    container.innerHTML = `
            <div class="form-container">
                <h1 class="form-title">Pet Registration</h1>
                
                <form id="petRegistrationForm">
                    <div class="form-section">
                        <h3 class="section-title-form">Pet Information</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="petName">Pet Name *</label>
                                <input type="text" id="petName" name="petName" required>
                            </div>
                            <div class="form-group">
                                <label for="species">Species *</label>
                                <select id="species" name="species" required>
                                    <option value="">Select Species</option>
                                    <option value="dog">Dog</option>
                                    <option value="cat">Cat</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="breed">Breed</label>
                                <input type="text" id="breed" name="breed">
                            </div>
                            <div class="form-group">
                                <label for="age">Age</label>
                                <input type="number" id="age" name="age" min="0">
                            </div>
                            <div class="form-group">
                                <label for="gender">Gender</label>
                                <select id="gender" name="gender">
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="weight">Weight (kg)</label>
                                <input type="number" id="weight" name="weight" step="0.1" min="0">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="medicalHistory">Medical History</label>
                            <textarea id="medicalHistory" name="medicalHistory" placeholder="Any previous medical conditions, surgeries, or treatments..."></textarea>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3 class="section-title-form">Owner Information</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="ownerName">Owner Name *</label>
                                <input type="text" id="ownerName" name="ownerName" required>
                            </div>

                            <div class="form-group">
                                <label for="ownerEmail">Email *</label>
                                <input type="email" id="ownerEmail" name="ownerEmail" required>
                            </div>

                            <div class="form-group">
                                <label for="ownerPhone">Phone Number</label>
                                <input type="tel" id="ownerPhone" name="ownerPhone">
                            </div>

                            <div class="form-group">
                                <label for="ownerAddress">Address</label>
                                <input type="text" id="ownerAddress" name="ownerAddress">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('form').reset()">Clear Form</button>
                        <button type="submit" class="btn btn-primary">
                            <span>Register Pet</span>
                        </button>
                    </div>
                </form>
            </div>
        `

    this.setupForm()
  },

  setupForm() {
    const form = document.getElementById("petRegistrationForm")
    form.addEventListener("submit", this.handleSubmit.bind(this))
  },

  async handleSubmit(e) {
    e.preventDefault()

    const formData = new FormData(e.target)
    const petData = Object.fromEntries(formData.entries())

    // Convert empty strings to null for optional fields
    Object.keys(petData).forEach(key => {
      if (petData[key] === '') {
        petData[key] = null
      }
    })

    try {
      const result = await window.api.createPet(petData)
      
      if (result.success) {
        alert("Pet registered successfully!")
        e.target.reset()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert("Network error. Please check if the server is running.")
    }
  },
}
