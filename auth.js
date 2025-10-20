// Authentication functionality
class Auth {
  constructor() {
    this.init()
  }

  init() {
    // Check if already logged in
    if (this.isLoggedIn() && window.location.pathname === "/index.html") {
      window.location.href = "dashboard.html"
    }

    // Setup login form
    const loginForm = document.getElementById("loginForm")
    if (loginForm) {
      loginForm.addEventListener("submit", this.handleLogin.bind(this))
    }

    // Setup password toggle
    this.setupPasswordToggle()
    
    // Setup remember me functionality
    this.setupRememberMe()
  }

  setupPasswordToggle() {
    const passwordToggle = document.getElementById("passwordToggle")
    const passwordInput = document.getElementById("password")
    
    if (passwordToggle && passwordInput) {
      passwordToggle.addEventListener("click", () => {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
        passwordInput.setAttribute("type", type)
        
        // Toggle eye icon
        const eyeIcon = passwordToggle.querySelector(".eye-icon")
        if (eyeIcon) {
          if (type === "text") {
            eyeIcon.innerHTML = `
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            `
          } else {
            eyeIcon.innerHTML = `
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            `
          }
        }
      })
    }
  }

  setupRememberMe() {
    const rememberMeCheckbox = document.getElementById("rememberMe")
    const usernameInput = document.getElementById("username")
    const passwordInput = document.getElementById("password")
    
    // Load saved credentials if remember me was checked
    if (localStorage.getItem("rememberMe") === "true") {
      const savedUsername = localStorage.getItem("savedUsername")
      const savedPassword = localStorage.getItem("savedPassword")
      
      if (savedUsername && usernameInput) {
        usernameInput.value = savedUsername
      }
      if (savedPassword && passwordInput) {
        passwordInput.value = savedPassword
      }
      if (rememberMeCheckbox) {
        rememberMeCheckbox.checked = true
      }
    }
  }

  async handleLogin(e) {
    e.preventDefault()

    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    const rememberMe = document.getElementById("rememberMe").checked
    const loginBtn = document.getElementById("loginBtn")
    const spinner = document.getElementById("spinner")
    const btnText = loginBtn.querySelector(".btn-text")

    // Show loading state
    loginBtn.disabled = true
    spinner.classList.remove("hidden")
    btnText.textContent = "Signing In..."

    // Check for empty fields
    if (!username || !password) {
      this.showError("Please enter both username and password.")
      loginBtn.disabled = false
      spinner.classList.add("hidden")
      btnText.textContent = "Sign In"
      return
    }

    try {
      // Call API for authentication
      const result = await window.api.login(username, password)
      
      if (result.success) {
        // Store auth state
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("username", result.user.username)
        localStorage.setItem("userId", result.user.id)

        // Handle remember me functionality
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true")
          localStorage.setItem("savedUsername", username)
          localStorage.setItem("savedPassword", password)
        } else {
          localStorage.removeItem("rememberMe")
          localStorage.removeItem("savedUsername")
          localStorage.removeItem("savedPassword")
        }

        // Redirect to dashboard
        window.location.href = "dashboard.html"
      } else {
        // Show error message
        this.showError(result.error || "Invalid username or password. Please try again.")
      }
    } catch (error) {
      this.showError("Network error. Please check if the server is running.")
    }

    // Reset button state
    loginBtn.disabled = false
    spinner.classList.add("hidden")
    btnText.textContent = "Sign In"
  }

  isLoggedIn() {
    return localStorage.getItem("isLoggedIn") === "true"
  }

  logout() {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("username")
    
    // Clear any cached pages
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, null, "index.html")
    }
    
    window.location.href = "index.html"
    
    // Prevent back button from going to dashboard
    window.history.pushState(null, null, "index.html")
  }

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = "index.html"
    }
  }

  showError(message) {
    // Remove any existing error messages
    const existingError = document.querySelector(".error-message")
    if (existingError) {
      existingError.remove()
    }

    // Remove error styling from inputs
    this.clearInputErrors()

    // Create error message element
    const errorDiv = document.createElement("div")
    errorDiv.className = "error-message"
    errorDiv.style.cssText = `
      background-color: #fee2e2;
      border: 1px solid #fca5a5;
      color: #dc2626;
      padding: 12px;
      border-radius: 6px;
      margin-top: 16px;
      text-align: center;
      font-size: 14px;
    `
    errorDiv.textContent = message

    // Insert error message after the form
    const form = document.getElementById("loginForm")
    form.appendChild(errorDiv)

    // Add error styling to inputs
    this.highlightInputErrors()

    // Auto-remove error after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove()
      }
      this.clearInputErrors()
    }, 5000)
  }

  highlightInputErrors() {
    const usernameInput = document.getElementById("username")
    const passwordInput = document.getElementById("password")
    
    if (usernameInput) {
      usernameInput.style.borderColor = "#fca5a5"
      usernameInput.style.backgroundColor = "#fef2f2"
    }
    if (passwordInput) {
      passwordInput.style.borderColor = "#fca5a5"
      passwordInput.style.backgroundColor = "#fef2f2"
    }
  }

  clearInputErrors() {
    const usernameInput = document.getElementById("username")
    const passwordInput = document.getElementById("password")
    
    if (usernameInput) {
      usernameInput.style.borderColor = ""
      usernameInput.style.backgroundColor = ""
    }
    if (passwordInput) {
      passwordInput.style.borderColor = ""
      passwordInput.style.backgroundColor = ""
    }
  }
}

// Initialize auth
window.auth = new Auth()
