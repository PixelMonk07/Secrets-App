# Secrets

A modern anonymous social platform where users can safely share thoughts, confessions, and stories without revealing their identity.

Unlike traditional anonymous confession websites, **Secrets** provides a polished social-media inspired interface with anonymous identities, reactions, editing, deleting, and secure authentication.

---

## ✨ Features

### 🔐 Authentication
- Local Email & Password Authentication
- Google OAuth 2.0 Login
- Secure Password Hashing using bcrypt
- Persistent Login Sessions
- Session Storage in PostgreSQL
- Logout functionality

---

### 👤 Anonymous Identity System

Instead of displaying usernames, every account receives a unique anonymous alias such as:

- `neon_tiger`
- `code_ape`
- `silent_raven`

This allows users to remain anonymous while still building a recognizable identity.

---

### 📝 Secret Management

Authenticated users can:

- Create new secrets
- View all secrets
- Edit their own secrets
- Delete their own secrets
- Real-time character counter while writing
- Responsive secret feed

---

### ❤️ Like System

Users can like or unlike any secret.

Features include:

- Toggle Like / Unlike
- Live Like Count
- Heart animation
- Remember previously liked posts
- Prevent duplicate likes using database constraints

---

### ✏️ Edit Secrets

Owners can edit their own posts through a beautiful popup modal.

Features:

- Popup editor
- Instant update without refreshing
- Ownership verification
- Character limit enforcement

---

### 🗑 Delete Secrets

Owners can delete their own secrets.

Features:

- Confirmation popup
- Quirky warning message
- Cancel option
- Close (X) button
- Permanent deletion

---

### 🎨 Modern UI / UX

Completely redesigned interface.

Includes:

- Dark mysterious theme
- Glassmorphism navbar
- Floating action button
- Animated cards
- Anonymous badges
- Responsive layout
- Custom modals
- Social media inspired feed
- Three-dot action menu for post owners

---

### 🛡 Security

- Password hashing (bcrypt)
- Helmet security headers
- Express Sessions
- PostgreSQL Session Store
- SQL Injection Protection
- Authentication Middleware
- Route Protection
- Rate Limiting
- Environment Variables

---

## 🛠 Tech Stack

### Frontend

- EJS
- HTML5
- CSS3
- Vanilla JavaScript
- Font Awesome

---

### Backend

- Node.js
- Express.js
- Passport.js

---

### Database

- PostgreSQL

---

### Authentication

- Passport Local Strategy
- Google OAuth 2.0

---

### Security

- bcrypt
- helmet
- express-session
- connect-pg-simple
- express-validator
- express-rate-limit

---

## 📂 Project Structure

```
SECRETS-APP
│
├── config/
│   ├── db.js
│   ├── env.js
│   └── passport.js
│
├── controllers/
│   ├── authController.js
│   └── secretController.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   └── rateLimiter.js
│
├── migrations/
│   ├── 001_create_users.js
│   ├── 002_create_session.js
│   ├── 003_create_secrets.js
│   ├── 004_add_anonymous_name.js
│   └── 005_create_likes.js
│
├── public/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── secret.js
│       ├── submit.js
│       └── logout.js
│
├── routes/
│   ├── authRoutes.js
│   └── secretRoutes.js
│
├── utils/
│   └── aliasGenerator.js
│
├── views/
│   ├── partials/
│        ├── footer.ejs
│        └── header.ejs
│   ├── home.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── secrets.ejs
│   ├── submit.ejs
│   └── edit.ejs
│
├── app.js
├── server.js
├── package.json
├── .env.example
└── README.md
```

---

## 🗄 Database Schema

### Users

| Column | Type |
|---------|------|
| id | SERIAL |
| email | VARCHAR |
| password | VARCHAR |
| anonymous_name | VARCHAR |

---

### Secrets

| Column | Type |
|---------|------|
| id | SERIAL |
| user_id | INTEGER |
| secret | TEXT |
| created_at | TIMESTAMP |

---

### Likes

| Column | Type |
|---------|------|
| id | SERIAL |
| user_id | INTEGER |
| secret_id | INTEGER |
| created_at | TIMESTAMP |

---

### Sessions

Managed automatically by **connect-pg-simple**.

---

## ⚙ Installation

### 1 Clone Repository

```bash
git clone https://github.com/yourusername/Secrets-App.git

cd Secrets-App
```

---

### 2 Install Packages

```bash
npm install
```

---

### 3 Create Environment Variables

Create a `.env` file.

```env
PORT=3000

SESSION_SECRET=your-secret

PG_USER=postgres
PG_PASSWORD=your-password
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=secrets

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

### 4 Run Database Migrations

```bash
npm run migrate up
```

---

### 5 Start Server

Development

```bash
npm run dev
```

Production

```bash
npm start
```

---

## 📜 Available Routes

### Authentication

| Method | Route | Description |
|---------|-------|-------------|
| GET | / | Home |
| GET | /login | Login Page |
| POST | /login | Login |
| GET | /register | Register Page |
| POST | /register | Register |
| GET | /logout | Logout |
| GET | /auth/google | Google Login |

---

### Secrets

| Method | Route | Description |
|---------|-------|-------------|
| GET | /secrets | View Feed |
| GET | /submit | Submit Page |
| POST | /submit | Create Secret |
| POST | /like/:secretId | Toggle Like |
| POST | /edit/:id | Edit Secret |
| POST | /delete/:id | Delete Secret |

---

## 🚀 Future Improvements

- 💬 Comments on secrets
- 🔔 Notifications
- 🔍 Search secrets
- 🏷 Tags & Categories
- 📌 Pin favorite secrets
- 📤 Share secrets
- 👤 User profiles (anonymous)
- 🌙 Dark / Light theme toggle
- 📱 Progressive Web App (PWA)
- 📊 Trending secrets
- 📈 Analytics dashboard
- 🔖 Bookmarks
- 🛡 Content moderation & reporting
- 📧 Email verification
- 🔑 Forgot password

---

## 👨‍💻 Author

**Niloy Pal**

Software Developer | Full Stack Developer

---

## 📄 License

This project is licensed under the MIT License.