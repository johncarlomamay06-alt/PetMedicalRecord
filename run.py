#!/usr/bin/env python3
"""
Pet Medical Records System - Simple HTTP Server
Run this to start your system with a local server
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

def main():
    # Get the directory where this script is located
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Configuration
    PORT = 8000
    HOST = 'localhost'
    
    print("=" * 50)
    print("🐾 Pet Medical Records System")
    print("=" * 50)
    print(f"Starting server on http://{HOST}:{PORT}")
    print("")
    print("Features:")
    print("✅ Real SQLite Database")
    print("✅ Export/Import Database")
    print("✅ Offline Functionality")
    print("✅ Data Persistence")
    print("")
    print("Login: admin / password123")
    print("")
    print("Press Ctrl+C to stop the server")
    print("=" * 50)
    
    # Create custom handler to serve files
    class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def end_headers(self):
            # Add CORS headers for better compatibility
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            super().end_headers()
        
        def do_GET(self):
            # If requesting root, serve index.html
            if self.path == '/':
                self.path = '/index.html'
            return super().do_GET()
    
    try:
        # Create server
        with socketserver.TCPServer((HOST, PORT), CustomHTTPRequestHandler) as httpd:
            print(f"Server running at http://{HOST}:{PORT}")
            print("Opening browser...")
            
            # Open browser automatically
            webbrowser.open(f'http://{HOST}:{PORT}')
            
            # Start serving
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n")
        print("Server stopped by user")
        print("Thank you for using Pet Medical Records System!")
        
    except OSError as e:
        if e.errno == 10048:  # Port already in use
            print(f"Error: Port {PORT} is already in use!")
            print("Please close other applications using this port or wait a moment.")
        else:
            print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
