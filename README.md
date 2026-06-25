# Secrets-APP

A web application that allows users to anonymously share secrets. Built with Node.js, Express, PostgreSQL, and features both local and Google OAuth authentication.

## Features

- User Authentication (Local & Google OAuth)
- Secure Password Hashing with bcrypt
- Session Management
- PostgreSQL Database Integration
- Anonymous Secret Sharing
- Responsive Bootstrap UI

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Authentication:** Passport.js
- **Security:** bcrypt
- **Frontend:** EJS, Bootstrap
- **Others:** Express-session, dotenv

## Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd secrets-project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file with:
   ```env
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   SESSION_SECRET="your-session-secret"
   PG_USER="postgres"
   PG_HOST="localhost"
   PG_DATABASE="secrets"
   PG_PASSWORD="your-password"
   PG_PORT="5432"
   ```

4. **Set up PostgreSQL:**
   ```sql
      CREATE TABLE users (
   id SERIAL PRIMARY KEY,
   email VARCHAR(100) UNIQUE NOT NULL,
   password VARCHAR(255)
   );

   CREATE TABLE secrets (
   id SERIAL PRIMARY KEY,
   user_id INTEGER REFERENCES users(id),
   secret TEXT NOT NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

5. **Run the application:**
   ```bash
   node index.js
   ```

## Project Structure

```
secrets-project/
├── public/
│   └── css/
│       └── styles.css
├── views/
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── home.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── secrets.ejs
│   └── submit.ejs
├── .env
├── .gitignore
├── index.js
└── package.json
```

## Features Breakdown

### Authentication
- Local authentication with email/password
- Google OAuth integration
- Session management
- Password hashing with bcrypt

### User Features
- Register new account
- Login with existing account
- Submit secrets anonymously
- View submitted secrets
- Google Sign-in option

## Security Features

- Password Hashing
- Session Management
- Environment Variables
- SQL Injection Prevention
- CSRF Protection

## API Routes

### GET Routes
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/secrets` - View secrets (authenticated)
- `/submit` - Submit secrets (authenticated)
- `/auth/google` - Google authentication
- `/logout` - Logout user

### POST Routes
- `/login` - Process login
- `/register` - Process registration
- `/submit` - Submit new secret

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
