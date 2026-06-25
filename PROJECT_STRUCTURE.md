# Secrets App - Refactored

A secure application for sharing secrets with authentication using Passport.js (Local & Google OAuth).

## Project Structure

```
SECRETS-APP/
├── config/              # Configuration files
│   ├── db.js           # Database connection setup
│   └── passport.js     # Passport authentication configuration
│
├── controllers/        # Business logic
│   ├── authController.js     # Authentication logic
│   └── secretController.js   # Secret management logic
│
├── middleware/         # Express middlewares
│   ├── authMiddleware.js     # Authentication guards
│   ├── rateLimiter.js        # Rate limiting
│   └── errorHandler.js       # Error handling
│
├── routes/            # API routes
│   ├── authRoutes.js   # Authentication routes
│   └── secretRoutes.js # Secret routes
│
├── migrations/        # Database migrations
│   ├── 001_create_users.js
│   ├── 002_create_secrets.js
│   └── 003_create_sessions.js
│
├── public/            # Static files
│   └── css/
│       └── styles.css
│
├── views/             # EJS templates
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── home.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── secrets.ejs
│   └── submit.ejs
│
├── app.js             # Express app setup
├── server.js          # Server entry point
├── .env               # Environment variables (not in git)
├── .env.example       # Environment variables template
├── .gitignore         # Git ignore rules
├── package.json       # Dependencies
└── README.md          # This file
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create .env file:**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your actual values:
   - Google OAuth credentials
   - PostgreSQL connection details
   - Session secret

3. **Run migrations:**
   ```bash
   npm run migrate up
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`

## Key Features

- ✅ Local authentication (email/password)
- ✅ Google OAuth 2.0 integration
- ✅ Password hashing with bcrypt
- ✅ Rate limiting on auth endpoints
- ✅ Session management with PostgreSQL
- ✅ Secrets storage (per-user)
- ✅ Security headers with Helmet
- ✅ Input validation with express-validator
- ✅ Logging with Winston
- ✅ Flash messages for user feedback

## Routes

### Auth Routes (`/routes/authRoutes.js`)
- `GET /login` - Login page
- `GET /register` - Register page
- `POST /register` - Register user
- `POST /login` - Login user
- `GET /logout` - Logout user
- `GET /auth/google` - Google OAuth
- `GET /auth/google/secrets` - Google OAuth callback

### Secret Routes (`/routes/secretRoutes.js`)
- `GET /secrets` - View user's secrets
- `GET /submit` - Submit secret page
- `POST /submit` - Submit new secret

## Controllers

### authController.js
Handles user registration, login, and authentication flows.

### secretController.js
Handles secret retrieval and submission.

## Middleware

### authMiddleware.js
- `isAuthenticated` - Guards protected routes
- `isNotAuthenticated` - Prevents authenticated users from accessing auth routes

### rateLimiter.js
Rate limits authentication endpoints (10 requests per 15 minutes)

### errorHandler.js
Centralized error handling for Express

## Database

Uses PostgreSQL with migrations managed by db-migrate.

Create tables:
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE,
  password TEXT
);

CREATE TABLE secrets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users,
  secret TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE session (
  sid VARCHAR PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP NOT NULL
);
```

## Security

- Password hashing with bcrypt
- Session management with secure cookies
- CSRF protection via sessions
- Rate limiting on auth endpoints
- Security headers with Helmet
- Input validation with express-validator
