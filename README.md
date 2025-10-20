# Pet Medical Records System

A comprehensive pet medical records management system built with Node.js, SQLite, and vanilla JavaScript.

## Features

- **User Authentication**: Secure login with username/password
- **Pet Registration**: Register new pets with detailed information
- **Medical Records**: Create and manage medical visit records
- **Dashboard**: View statistics and recent visits
- **Record Management**: View, print, and delete pet records
- **SQLite Database**: Persistent data storage with proper relationships

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Open your browser and go to: `http://localhost:3000`
   - Default login credentials:
     - Username: `admin`
     - Password: `password123`

## Database Schema

The system uses SQLite with the following tables:

### Users Table
- `id` (INTEGER PRIMARY KEY)
- `username` (TEXT UNIQUE)
- `password` (TEXT)
- `role` (TEXT)
- `created_at` (DATETIME)

### Pets Table
- `id` (INTEGER PRIMARY KEY)
- `pet_name` (TEXT)
- `species` (TEXT)
- `breed` (TEXT)
- `age` (INTEGER)
- `gender` (TEXT)
- `weight` (REAL)
- `medical_history` (TEXT)
- `owner_name` (TEXT)
- `owner_email` (TEXT)
- `owner_phone` (TEXT)
- `owner_address` (TEXT)
- `registration_date` (DATETIME)

### Medical Records Table
- `id` (INTEGER PRIMARY KEY)
- `pet_id` (INTEGER FOREIGN KEY)
- `visit_date` (DATE)
- `visit_type` (TEXT)
- `veterinarian` (TEXT)
- `symptoms` (TEXT)
- `diagnosis` (TEXT)
- `treatment` (TEXT)
- `vaccines` (TEXT)
- `notes` (TEXT)
- `weight` (REAL)
- `temperature` (REAL)
- `created_at` (DATETIME)

## API Endpoints

### Authentication
- `POST /api/login` - User login

### Pets
- `GET /api/pets` - Get all pets
- `POST /api/pets` - Create new pet
- `DELETE /api/pets/:id` - Delete pet and related records

### Medical Records
- `GET /api/medical-records` - Get all medical records
- `POST /api/medical-records` - Create new medical record

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## File Structure

```
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── api.js                 # Frontend API service
├── auth.js                # Authentication logic
├── app.js                 # Main application logic
├── dashboard-content.js   # Dashboard functionality
├── pet-registration.js    # Pet registration form
├── medical-records.js     # Medical records form
├── manage-records.js      # Record management
├── index.html             # Login page
├── dashboard.html         # Main dashboard
├── styles.css             # Application styles
└── pet_medical_records.db # SQLite database (created automatically)
```

## Usage

1. **Login**: Use the default credentials or create new users in the database
2. **Register Pets**: Add new pets with owner information
3. **Create Medical Records**: Record visits and treatments for registered pets
4. **View Dashboard**: See statistics and recent activity
5. **Manage Records**: View, print, or delete pet records

## Development

The server runs on port 3000 by default. The database file (`pet_medical_records.db`) is created automatically on first run.

### Adding New Users

To add new users, you can either:
1. Insert directly into the database
2. Modify the server.js to include additional default users
3. Add a user registration endpoint

## Security Notes

- Passwords are stored in plain text (for demo purposes)
- In production, implement proper password hashing
- Add input validation and sanitization
- Implement proper session management
- Use HTTPS in production

## Troubleshooting

- **Server won't start**: Check if port 3000 is available
- **Database errors**: Ensure SQLite3 is properly installed
- **API errors**: Check browser console for network errors
- **Login issues**: Verify the database has the default admin user

## License

MIT License - feel free to use and modify as needed.
