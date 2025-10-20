// Dashboard content and functionality
window.dashboardContent = {
  async init() {
    await this.renderDashboard()
  },

  async renderDashboard() {
    const container = document.getElementById("dashboardContainer")
    if (!container) return

    // Show loading state
    container.innerHTML = '<div class="loading">Loading dashboard...</div>'

    try {
      const [pets, visits, stats] = await Promise.all([
        window.api.getPets(),
        window.api.getMedicalRecords(),
        window.api.getDashboardStats()
      ])

      container.innerHTML = `
            <div class="dashboard-grid">
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">Total Pets</div>
                        <div class="stat-icon" style="background: #dbeafe; color: #1e40af;">
                            <img src="pictures/dog.png" alt="Pets" class="stat-icon-img" width="20" height="20">
                        </div>
                    </div>
                    <div class="stat-value">${stats.totalPets}</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">Total Owners</div>
                        <div class="stat-icon" style="background: #d1fae5; color: #065f46;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </div>
                    </div>
                    <div class="stat-value">${stats.totalOwners}</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">Total Visits</div>
                        <div class="stat-icon" style="background: #fef3c7; color: #92400e;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14,2 14,8 20,8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                            </svg>
                        </div>
                    </div>
                    <div class="stat-value">${stats.totalVisits}</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">This Month</div>
                        <div class="stat-icon" style="background: #e0e7ff; color: #3730a3;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                        </div>
                    </div>
                    <div class="stat-value">${stats.thisMonthVisits}</div>
                </div>
            </div>
            
            <div class="recent-section">
                <div class="section-header">
                    <h2 class="section-title">Recent Visits</h2>
                </div>
                <div class="visits-list">
                    ${this.renderRecentVisits(visits)}
                </div>
            </div>
        `
    } catch (error) {
      console.error('Error loading dashboard:', error)
      container.innerHTML = '<div class="error">Error loading dashboard. Please try again.</div>'
    }
  },

  renderRecentVisits(visits) {
    const recent = visits.slice(-5).reverse()

    if (recent.length === 0) {
      return '<div class="visit-item"><p>No recent visits</p></div>'
    }

    return recent
      .map(
        (visit) => `
            <div class="visit-item">
                <div class="visit-info">
                    <h4>${visit.pet_name}</h4>
                    <p>${visit.diagnosis} - ${new Date(visit.visit_date).toLocaleDateString()}</p>
                </div>
                <span class="status-badge completed">Completed</span>
            </div>
        `,
      )
      .join("")
  },
}
