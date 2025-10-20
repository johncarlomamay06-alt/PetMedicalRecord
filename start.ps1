# Pet Medical Records System Launcher
Write-Host "Starting Pet Medical Records System..." -ForegroundColor Green
Write-Host ""

# Check if index.html exists
if (Test-Path "index.html") {
    Write-Host "Opening your system in the default browser..." -ForegroundColor Yellow
    Start-Process "index.html"
    Write-Host ""
    Write-Host "System started! Your browser should open automatically." -ForegroundColor Green
    Write-Host ""
    Write-Host "The system is now running offline with SQLite database support!" -ForegroundColor Cyan
    Write-Host "Login: admin / password123" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To stop the system, close this window or press Ctrl+C" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
} else {
    Write-Host "Error: index.html not found!" -ForegroundColor Red
    Write-Host "Make sure you're in the correct directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
}
