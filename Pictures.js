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
  }

  async handleLogin(e) {
    e.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const loginBtn = document.getElementById("loginBtn")
    const spinner = document.getElementById("spinner")
    const btnText = loginBtn.querySelector(".btn-text")

    // Show loading state
    loginBtn.disabled = true
    spinner.classList.remove("hidden")
    btnText.textContent = "Signing In..."

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Simple validation (in real app, this would be server-side)
    if (email && password) {
      // Store auth state
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userEmail", email)

      // Redirect to dashboard
      window.location.href = "dashboard.html"
    } else {
      alert("Please enter valid credentials")

      // Reset button state
      loginBtn.disabled = false
      spinner.classList.add("hidden")
      btnText.textContent = "Sign In"
    }
  }

  isLoggedIn() {
    return localStorage.getItem("isLoggedIn") === "true"
  }

  logout() {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userEmail")
    window.location.href = "index.html"
  }

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = "index.html"
    }
  }
}

// Initialize auth
const auth = new Auth()
