// Main application functionality
// Auth will be available from auth.js

class PetMedicalApp {
  constructor() {
    this.currentPage = "dashboard"
    this.init()
  }

  init() {
    // Check authentication
    if (!window.auth || !window.auth.isLoggedIn()) {
      window.location.href = "index.html"
      return
    }

    this.setupUserInfo()
    this.setupNavigation()
    this.setupMobileMenu()
    this.setupLogout()
    this.loadPage("dashboard")
  }

  setupUserInfo() {
    const username = localStorage.getItem("username")
    const userNameElement = document.getElementById("userName")
    const userAvatarElement = document.getElementById("userAvatar")
    
    if (username && userNameElement) {
      userNameElement.textContent = username
    }
    
    if (username && userAvatarElement) {
      userAvatarElement.textContent = username.charAt(0).toUpperCase()
    }
  }

  setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item")
    navItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault()
        const page = item.dataset.page
        this.loadPage(page)

        // Update active state
        navItems.forEach((nav) => nav.classList.remove("active"))
        item.classList.add("active")

        // Close mobile menu if open
        document.getElementById("sidebar").classList.remove("open")
      })
    })
  }

  setupMobileMenu() {
    const mobileMenu = document.getElementById("mobileMenu")
    const mobileClose = document.getElementById("mobileClose")
    const sidebar = document.getElementById("sidebar")

    mobileMenu.addEventListener("click", () => {
      sidebar.classList.add("open")
    })

    mobileClose.addEventListener("click", () => {
      sidebar.classList.remove("open")
    })

    // Close on overlay click
    document.addEventListener("click", (e) => {
      if (sidebar.classList.contains("open") && !sidebar.contains(e.target) && !mobileMenu.contains(e.target)) {
        sidebar.classList.remove("open")
      }
    })
  }

  setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn")
    logoutBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to logout?")) {
        window.auth.logout()
      }
    })
  }

  loadPage(page) {
    this.currentPage = page
    const contentArea = document.getElementById("contentArea")
    const pageTitle = document.getElementById("pageTitle")

    // Update page title
    const titles = {
      dashboard: "Dashboard",
      "pet-registration": "Pet Registration",
      "medical-records": "Medical Records",
      "manage-records": "Manage Records",
    }
    pageTitle.textContent = titles[page] || "Dashboard"

    // Load page content
    switch (page) {
      case "dashboard":
        contentArea.innerHTML = this.getDashboardContent()
        if (window.dashboardContent) {
          window.dashboardContent.init()
        }
        break
      case "pet-registration":
        contentArea.innerHTML = this.getPetRegistrationContent()
        if (window.petRegistration) {
          window.petRegistration.init()
        }
        break
      case "medical-records":
        contentArea.innerHTML = this.getMedicalRecordsContent()
        if (window.medicalRecords) {
          window.medicalRecords.init()
        }
        break
      case "manage-records":
        contentArea.innerHTML = this.getManageRecordsContent()
        if (window.manageRecords) {
          window.manageRecords.init()
        }
        break
    }
  }

  getDashboardContent() {
    return '<div id="dashboardContainer">Loading dashboard...</div>'
  }

  getPetRegistrationContent() {
    return '<div id="petRegistrationContainer">Loading pet registration...</div>'
  }

  getMedicalRecordsContent() {
    return '<div id="medicalRecordsContainer">Loading medical records...</div>'
  }

  getManageRecordsContent() {
    return '<div id="manageRecordsContainer">Loading manage records...</div>'
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.app = new PetMedicalApp()
})
