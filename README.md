# 🌟 UserHub — Enterprise User Management System

![Project Badge](https://img.shields.io/badge/Project-UserHub-4f46e5?style=for-the-badge)
![Internship Badge](https://img.shields.io/badge/Syntecxhub-Web%20Dev%20Internship%20Project%201-10b981?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**UserHub** is a responsive, production-ready full-stack **User Management System** built for the **Syntecxhub Web Development Internship (Project 1)**. It features an Express.js REST API with MongoDB Atlas and an admin dashboard engineered in pure HTML5, CSS3, and Vanilla JavaScript—without frontend frameworks like React or Vue.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start & Local Setup](#-quick-start--local-setup)
- [MongoDB Atlas Setup Guide](#-mongodb-atlas-setup-guide)
- [Environment Variables](#-environment-variables)
- [Database Seeding](#-database-seeding)
- [REST API Documentation](#-rest-api-documentation)
- [API Testing with Postman](#-api-testing-with-postman)
- [Deployment Guide](#-deployment-guide)
  - [Deploy Backend to Render](#1-deploy-backend-to-render)
  - [Deploy Frontend to GitHub Pages](#2-deploy-frontend-to-github-pages)
- [Security Best Practices](#-security-best-practices)

---

## 🚀 Key Features

### 💻 Frontend Admin Dashboard (Vanilla JS, HTML5, CSS3)
- **Modern Design System**: Clean typography (*Plus Jakarta Sans*), CSS variable-driven light and dark modes with persistent local preference, and glassmorphic elevation.
- **Responsive Layout**: Collapsible sidebar, mobile drawer navigation, sticky top navbar, and responsive data tables.
- **Analytics Metric Cards**: Real-time summary statistics for Total Users, Active Users, Privileged Roles (Admins & Managers), and New Registrations this month.
- **Live User Directory Table**:
  - Live search with 300ms debouncing across name, email, and phone.
  - Multi-attribute filtering by **Role** (*Admin, Manager, User*), **Status** (*Active, Inactive, Pending, Suspended*), and **Department**.
  - Dynamic column sorting (*Name, Email, Role, Status, Creation Date*).
  - Client-configurable pagination with selectable page sizes (*5, 10, 25, 50*).
- **Interactive Modals**:
  - **Add User Modal** with real-time form validation.
  - **Edit User Modal** with prefilled fields and optional password reset.
  - **User Profile Details Modal** displaying full metadata, contact information, and timestamps.
  - **Confirmation Dialog** before permanent deletion.
- **Dynamic API Switching**: Built-in API configuration modal to change the backend endpoint dynamically without code edits (ideal when switching between local development and deployed Render environments).
- **Toast Notifications & Feedback**: Animated non-intrusive feedback toasts for success, error, warning, and informational states.
- **Empty & Error State Fallbacks**: Visual error fallbacks with retry and configuration actions.

### ⚙️ Backend & REST API (Node.js, Express, MongoDB Atlas)
- **Stateless JWT Authentication**: Secure HTTP Bearer token authorization with configurable expiration.
- **Bcrypt Password Hashing**: Passwords salted and hashed with 10 rounds; passwords explicitly omitted from default query projections.
- **Role-Based Access Control (RBAC)**: Fine-grained middleware authorization protecting routes based on role (`admin`, `manager`, `user`).
- **Account Safeguards**: Prevents administrators from accidentally deleting their own accounts or demoting their privileges.
- **Input Sanitization & Validation**: Server-side checks for email formats, duplicate registrations, minimum password lengths, and required schema fields.
- **Centralized Error Handling**: Unified JSON error envelope handling Mongoose `ValidationError`, `CastError` (invalid ObjectIDs), and duplicate index collisions (`code 11000`).
- **Configurable CORS**: Supports local development ports and GitHub Pages domains.

---

## 🛠 Architecture & Tech Stack

```mermaid
graph TD
    Client["Frontend Client<br>(GitHub Pages / Local)<br>HTML5 + CSS3 + Vanilla JS"]
    API["Express.js REST API<br>(Node.js on Render)"]
    DB[("MongoDB Atlas Cloud<br>Mongoose ODM")]

    Client -->|"HTTP Requests + JWT Bearer"| API
    API -->|"Mongoose CRUD & Aggregation"| DB
```

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript | No frameworks (No React, Angular, or Vue). Pure standards-compliant code. |
| **Icons & Fonts** | Font Awesome 6, Google Fonts | Plus Jakarta Sans, JetBrains Mono. |
| **Backend** | Node.js (v18+), Express.js | Modular controller-service-route pattern. |
| **Database** | MongoDB Atlas with Mongoose | Cloud NoSQL schema with timestamps and indexing. |
| **Security** | bcryptjs, jsonwebtoken, cors | Secure hashing and stateless JWT validation. |
| **API Testing** | Postman | Bundled `UserHub_Postman_Collection.json`. |
| **Hosting** | Render (API) + GitHub Pages (Frontend) | Free-tier compatible production deployment. |

---

## 📂 Project Directory Structure

```text
UserHub/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB Atlas connection with reconnection logic
│   ├── controllers/
│   │   ├── authController.js      # Login, registration, profile operations
│   │   └── userController.js      # CRUD, analytics stats, search & filtering
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification & RBAC authorization
│   │   └── errorMiddleware.js     # Centralized 404 & exception handler
│   ├── models/
│   │   └── User.js                # Mongoose schema, bcrypt pre-save hook, methods
│   ├── routes/
│   │   ├── authRoutes.js          # Authentication endpoint routes
│   │   └── userRoutes.js          # User management CRUD routes
│   ├── .env.example               # Template for environment variables
│   ├── .gitignore                 # Excludes node_modules and .env
│   ├── package.json               # Backend dependencies and scripts
│   ├── seed.js                    # Database seeder with sample accounts
│   └── server.js                  # Express app entry point & CORS configuration
├── frontend/
│   ├── css/
│   │   └── style.css              # Design system: themes, responsive layouts, tables, modals
│   ├── js/
│   │   ├── api.js                 # Centralized fetch wrapper & endpoint services
│   │   ├── auth.js                # Auth state, session guard, theme, toasts
│   │   └── app.js                 # Dashboard table, modals, pagination, search
│   ├── index.html                 # Admin Dashboard portal
│   ├── login.html                 # User & administrator sign-in page
│   └── register.html              # New user registration page
├── UserHub_Postman_Collection.json# Complete Postman collection for API verification
└── README.md                      # Comprehensive project documentation
```

---

## 📋 Prerequisites

Before running the project locally, verify you have installed:
- [Node.js](https://nodejs.org/) (Version 18.x or higher)
- [npm](https://www.npmjs.com/) (Version 9.x or higher)
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or a local MongoDB instance)
- A modern web browser (Chrome, Firefox, Edge, Safari)

---

## ⚡ Quick Start & Local Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/<your-username>/user-management-system.git
cd user-management-system
```

### Step 2: Configure the Backend Environment
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and supply your MongoDB Atlas connection string and JWT secret:
   ```ini
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/userhub?retryWrites=true&w=majority
   JWT_SECRET=super_secret_jwt_key_userhub_2026
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5500,http://127.0.0.1:5500
   ```

> **⚡ Zero-Config Local Mode:** If you do not have MongoDB Atlas credentials yet, don't worry! The backend automatically detects unconfigured Atlas placeholders and runs in **Zero-Config Local Storage Mode** (`backend/data/users.json`), enabling all authentication, RBAC, and CRUD operations to work immediately. When you are ready to use MongoDB Atlas, simply provide your real `MONGODB_URI` and restart the server!

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Seed the Database (Recommended)
Populate your database with default sample users (Admin, Manager, and regular accounts):
```bash
npm run seed
```

### Step 5: Start the Backend Server
```bash
# Start in development mode with nodemon auto-restart:
npm run dev

# Or start with standard node:
npm start
```
The server will start at `http://127.0.0.1:5000`. Test the health check endpoint in your browser:
[http://127.0.0.1:5000/api/health](http://127.0.0.1:5000/api/health)

### Step 6: Run the Frontend Locally
You can serve the `frontend/` directory using any local static web server:
- **Using VS Code Live Server Extension**: Right click `frontend/login.html` and choose **Open with Live Server** (runs on port 5500).
- **Using Node `npx serve`**:
  ```bash
  npx serve frontend -p 5500
  ```
- **Using Python built-in HTTP server**:
  ```bash
  cd frontend
  python -m http.server 5500
  ```

Open your browser to:
```text
http://127.0.0.1:5500/login.html
```

---

## 🍃 MongoDB Atlas Setup Guide

1. **Sign Up / Log In**: Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an account.
2. **Create a Free Cluster**:
   - Choose **M0 Free** (Shared) cluster.
   - Select a provider and region nearest to your location.
   - Click **Create Deployment**.
3. **Configure Database Access (User Credentials)**:
   - Navigate to **Security** -> **Database Access**.
   - Click **Add New Database User**.
   - Authentication method: **Password**.
   - Choose a username (e.g., `userhub_admin`) and a secure password.
   - Built-in Role: **Read and write to any database**.
   - Click **Add User**.
4. **Configure Network Access (IP Whitelist)**:
   - Navigate to **Security** -> **Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) so that both your local machine and Render can access the database.
   - Click **Confirm**.
5. **Get Connection String**:
   - Navigate to **Database** -> **Deployment** -> Click **Connect**.
   - Choose **Drivers** (Node.js).
   - Copy the connection string format:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/userhub?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database user credentials.
   - Place this string into your `backend/.env` file as `MONGODB_URI`.

---

## 🔑 Environment Variables

The backend relies on the following environment variables (stored in `backend/.env`):

| Variable | Required | Description | Example |
|---|---|---|---|
| `PORT` | Optional | Port for the Express server (defaults to 5000). | `5000` |
| `NODE_ENV` | Optional | Environment mode: `development` or `production`. | `development` |
| `MONGODB_URI` | **Required** | MongoDB Atlas connection string URI. | `mongodb+srv://user:pass@cluster.mongodb.net/userhub` |
| `JWT_SECRET` | **Required** | Secret key used to sign and verify JWT tokens. | `your_random_secret_string_min_32_chars` |
| `JWT_EXPIRES_IN` | Optional | Duration before JWT expires. | `7d` |
| `CLIENT_URL` | Optional | Comma-separated list of allowed frontend origins for CORS. | `http://127.0.0.1:5500,https://username.github.io` |

---

## 👥 Database Seeding

A seed script is included in `backend/seed.js` to create demo accounts with varied roles, departments, and statuses.

Run the seeder with:
```bash
cd backend
npm run seed
```

### Pre-configured Sample Credentials:

| Role | Name | Email | Password | Status | Department |
|---|---|---|---|---|---|
| **Admin** | Sarah Connor | `admin@userhub.com` | `Admin@123456` | Active | Executive |
| **Manager** | Marcus Vance | `manager@userhub.com` | `Manager@123456` | Active | Engineering |
| **User** | David Chen | `david.chen@userhub.com` | `User@123456` | Active | Engineering |
| **User** | Elena Rostova | `elena.rostova@userhub.com` | `User@123456` | Active | Product Design |
| **User** | Liam Gallagher | `liam.g@userhub.com` | `User@123456` | Pending | Customer Support |
| **User** | Sophia Martinez | `sophia.m@userhub.com` | `User@123456` | Inactive | Human Resources |
| **User** | Kenji Takahashi | `kenji.t@userhub.com` | `User@123456` | Suspended | Finance |

> **Tip:** The `login.html` page includes an **"Auto-fill Admin"** quick button to fill demo credentials with a single click.

---

## 📡 REST API Documentation

### Base URL:
- Local Development: `http://127.0.0.1:5000/api`
- Production (Render): `https://<your-render-service>.onrender.com/api`

### 1. Authentication Endpoints (`/api/auth`)

#### `POST /api/auth/register`
Register a new public user account.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@company.com",
    "password": "Password@123",
    "department": "Engineering",
    "phone": "+1 (555) 234-5678"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Account registered successfully!",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "_id": "671400...",
      "name": "Jane Doe",
      "email": "jane.doe@company.com",
      "role": "user",
      "status": "active",
      "department": "Engineering",
      "phone": "+1 (555) 234-5678",
      "avatar": "https://ui-avatars.com/api/...",
      "createdAt": "2026-10-19T18:00:00.000Z"
    }
  }
  ```

#### `POST /api/auth/login`
Authenticate with email and password to receive a JWT.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "admin@userhub.com",
    "password": "Admin@123456"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logged in successfully!",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "_id": "671400...",
      "name": "Sarah Connor",
      "email": "admin@userhub.com",
      "role": "admin",
      "status": "active"
    }
  }
  ```

#### `GET /api/auth/me`
Retrieve profile of currently authenticated user.
- **Access**: Private (Requires `Authorization: Bearer <token>`)
- **Success Response (200 OK)**: Returns user object.

#### `PUT /api/auth/update-profile`
Allow user to update their name, phone, department, or password.
- **Access**: Private (Requires `Authorization: Bearer <token>`)

---

### 2. User Management Endpoints (`/api/users`)

All user endpoints require an `Authorization: Bearer <token>` header.

#### `GET /api/users/stats`
Get dashboard metrics and user status breakdown.
- **Access**: Private (Admin, Manager)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "stats": {
      "totalUsers": 8,
      "activeUsers": 5,
      "inactiveUsers": 1,
      "pendingUsers": 1,
      "suspendedUsers": 1,
      "adminCount": 1,
      "managerCount": 1,
      "userCount": 6,
      "newUsersThisMonth": 8
    }
  }
  ```

#### `GET /api/users`
List users with search, filtering, sorting, and pagination.
- **Access**: Private (Admin, Manager)
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `search` (string, matches name, email, or phone)
  - `role` (string: `admin`, `manager`, `user`, or `all`)
  - `status` (string: `active`, `inactive`, `pending`, `suspended`, or `all`)
  - `department` (string: department name or `all`)
  - `sortBy` (string: `name`, `email`, `role`, `status`, `createdAt`, `lastLogin`)
  - `order` (string: `asc` or `desc`)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 8,
    "totalUsers": 8,
    "totalPages": 1,
    "currentPage": 1,
    "limit": 10,
    "users": [ ... ]
  }
  ```

#### `GET /api/users/:id`
Retrieve full details for a single user by MongoDB ID.
- **Access**: Private (Admin, Manager)

#### `POST /api/users`
Admin creates a new user account directly.
- **Access**: Private (Admin only)
- **Request Body**:
  ```json
  {
    "name": "Marcus Aurelius",
    "email": "marcus.a@company.com",
    "password": "Password@123",
    "role": "manager",
    "status": "active",
    "department": "Engineering",
    "phone": "+1 (555) 765-4321"
  }
  ```

#### `PUT /api/users/:id`
Admin updates an existing user account.
- **Access**: Private (Admin only)
- **Request Body**: Any editable fields (`name`, `email`, `role`, `status`, `department`, `phone`, `password`).

#### `DELETE /api/users/:id`
Admin deletes a user account permanently.
- **Access**: Private (Admin only)
- **Safety Restriction**: An admin cannot delete their own active account (`400 Bad Request`).

---

## 🧪 API Testing with Postman

A complete Postman collection is included in the project root:
[`UserHub_Postman_Collection.json`](UserHub_Postman_Collection.json).

### How to Import and Test:
1. Open the **Postman** desktop app or web client.
2. Click **Import** in the upper left corner.
3. Drag and drop the `UserHub_Postman_Collection.json` file into the window.
4. The collection **UserHub REST API Collection** will appear in your sidebar with preconfigured requests:
   - System Health Check
   - Auth: Admin Login
   - Auth: Register New User
   - Auth: Get Current Profile
   - Auth: Update Profile
   - Users: Get Analytics Stats
   - Users: List Users (Search & Pagination)
   - Users: Get Single User
   - Users: Create User (Admin)
   - Users: Update User (Admin)
   - Users: Delete User (Admin)
5. **Auto-saved Token**: When you execute `1. Login Admin`, a Postman test script automatically extracts the JWT token from the response and sets it into the collection variable `{{token}}`. Subsequent protected requests will automatically include this token in their authorization headers!

---

## 🌐 Deployment Guide

### 1. Deploy Backend to Render

[Render](https://render.com) offers free cloud hosting for Node.js web services.

1. **Push your code to GitHub**:
   Ensure your project is pushed to a GitHub repository.
2. **Create a new Web Service**:
   - Log in to your [Render Dashboard](https://dashboard.render.com).
   - Click **New +** -> **Web Service**.
   - Connect your GitHub repository.
3. **Configure Service Settings**:
   - **Name**: `userhub-api` (or your chosen name)
   - **Region**: Choose closest to your MongoDB Atlas cluster.
   - **Branch**: `main`
   - **Root Directory**: `backend` (Important: points to backend subfolder)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
4. **Add Environment Variables**:
   Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random secret string.
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: Your GitHub Pages URL (e.g. `https://<your-username>.github.io`)
5. **Deploy**:
   - Click **Create Web Service**.
   - Wait 1-2 minutes for build and deployment.
   - Once active, copy your Render URL: `https://userhub-api.onrender.com`.
   - Verify health: `https://userhub-api.onrender.com/api/health`.

---

### 2. Deploy Frontend to GitHub Pages

GitHub Pages serves static sites directly from a GitHub repository.

1. **Option A: Deploy from `gh-pages` branch**:
   You can push the `frontend/` contents to a `gh-pages` branch:
   ```bash
   git subtree push --prefix frontend origin gh-pages
   ```
2. **Option B: Deploy from Repository Root / Docs**:
   - If hosting from root, move or copy `frontend/` files to root or `/docs` folder.
   - Go to your repository on GitHub -> **Settings** -> **Pages**.
   - Under **Build and deployment**:
     - Source: **Deploy from a branch**.
     - Branch: `gh-pages` / `root` (or `main` / `docs`).
   - Click **Save**.
3. **Connect Frontend to Deployed Render API**:
   - Open your deployed GitHub Pages site.
   - On `login.html`, click the **"Change"** API link.
   - Enter your Render backend URL (e.g., `https://userhub-api.onrender.com/api`).
   - Click **Save API URL**.
   - The frontend persists this in `localStorage` and will communicate with your live Render backend!

---

## 🛡 Security Best Practices

1. **No Credentials in Version Control**: All sensitive values (database connection strings, JWT signing keys) are isolated in `.env` files and excluded via `.gitignore`.
2. **Password Salting & Hashing**: All passwords use `bcrypt` with work factor 10.
3. **Hidden Passwords**: User Mongoose schema marks `password: { select: false }` so passwords are never inadvertently exposed in query results.
4. **Token Security**: JWT tokens are transmitted via standard `Authorization: Bearer <token>` headers.
5. **Self-Deletion Protection**: Administrators cannot delete their own accounts or remove their own admin privileges.
6. **Input Validation**: Rigorous email format checking and input length enforcement both client-side and server-side.

---

## 📄 License & Credits

- **Project**: UserHub — User Management System
- **Program**: Syntecxhub Web Development Internship — Project 1
- **Developer**: Senior Full-Stack Engineering Implementation
- **License**: MIT
