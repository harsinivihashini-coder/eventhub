# CommunityHub — Event Management System

A full-stack community event management platform for apartments and colleges.

## Tech Stack
- **Frontend:** React, React Router, Axios, react-hot-toast, lucide-react
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL

---

## Setup Instructions

### 1. Database Setup
Open pgAdmin or psql and run:
```sql
-- Copy and run the contents of backend/db/schema.sql
```

### 2. Backend Setup
```bash
cd backend
# Edit .env with your PostgreSQL credentials
npm run dev        # starts on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm start          # starts on http://localhost:3000
```

---

## Features
| Feature | Admin | Member |
|---|---|---|
| Register / Login | ✅ | ✅ |
| View all events | ✅ | ✅ |
| Register for events | ✅ | ✅ |
| View attendees | ✅ | ✅ |
| Create / Edit / Delete events | ✅ | ❌ |
| Dashboard stats | ✅ | ❌ |
| My registrations | ✅ | ✅ |

## API Endpoints
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | — | Register user |
| POST | /api/auth/login | — | Login |
| GET | /api/events | ✅ | List all events |
| POST | /api/events | Admin | Create event |
| PUT | /api/events/:id | Admin | Update event |
| DELETE | /api/events/:id | Admin | Delete event |
| POST | /api/registrations/:eventId | ✅ | Register for event |
| DELETE | /api/registrations/:eventId | ✅ | Unregister |
| GET | /api/registrations/my/events | ✅ | My registered events |
| GET | /api/users/stats | Admin | Dashboard stats |
