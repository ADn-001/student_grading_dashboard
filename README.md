
# Student Grading Dashboard (Final Project Version)
**Project made by:** Adnan Mohammed Shelim
## please note: this is the project branch for final.
A robust, secure, and role-based **Student Grading Dashboard** built with the MERN stack.

**This is the final project version, featuring a complete UI overhaul (modern light mode, card-based dashboard, responsive design) and comprehensive security improvements.**

Admins, Teachers, and Students can log in and perform their respective tasks with a modern, accessible, and visually appealing UI.


## Features by Role

**Admins**
- Add, edit, and delete users (admins, teachers, students)
- Assign courses to teachers and students
- Add major, graduation, and semester info to students
- Add other admins

**Teachers**
- Create and delete assignments (with file uploads)
- View and grade student submissions
- Update student grades for enrolled courses

**Students**
- View grades and assignments for enrolled courses
- Submit assignment files

---

## UI Overhaul

- Modern light-mode, card-based dashboard (Figma-inspired)
- Sidebar and header navigation for all roles
- Responsive design for all devices
- Visually appealing forms, tables, and cards
- Role-based navigation and content
- Accessible, clean, and consistent layout

---
### Figma link: 
https://www.figma.com/design/xapBnQ65iniTLl0PO5Dmsc/Online-Coaching-Teacher-s-Admin-Panel--Community-?node-id=0-1&p=f&t=y5bwo9LAsxQEiGpQ-0
---

## Security & Validation (Final Version)

- **JWT Authentication**: All protected routes require a valid JWT token; tokens are issued on login and checked on every request.
- **Role-Based Access Control**: All backend routes enforce role checks (admin, teacher, student) using middleware.
- **Input Validation & Sanitization**: All user input is validated and sanitized on the backend (using express-validator and custom middleware) to prevent injection and XSS.
- **Password Hashing & Salting**: User passwords are hashed and salted using bcrypt before storage; never stored in plaintext.
- **File Validation**: All file uploads (assignments, submissions) are validated for type and size; only allowed extensions are accepted.
- **Sensitive Data Protection**: Passwords are never returned in API responses; user data is filtered.

---

### Project Directory Tree

```
student_grading_dashboard/
├── backend/
│   ├── models/
│   │   ├── Assignment.js
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Major.js
│   │   └── Batch.js
│   ├── middleware/
│   │   ├── auth.js
│   ├── routes/
│   │   ├── assignmentRoutes.js
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── courseRoutes.js
│   ├── seed.js              # Database seeding script
│   ├── server.js            # Express server
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api.js
│   │   ├── App.js
│   │   ├── App.css          # Global light mode (modern UI)
│   │   ├── Login.js
│   │   ├── Sidebar.js
│   │   ├── Header.js
│   │   ├── Account.js
│   │   ├── AdminDashboard.js
│   │   ├── TeacherDashboard.js
│   │   ├── TeacherAssignments.js
│   │   ├── StudentAssignments.js
│   │   ├── StudentDashboard.js
│   │   └── index.js
│   └── package.json
│
├── README.md
└── .gitignore
```

---

### Tech Stack & Tools

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Frontend     | React (Create React App), React Router  |
| Backend      | Node.js, Express                        |
| Database     | MongoDB (local) + Mongoose              |
| Styling      | Pure CSS (no external libraries, modern light mode) |
| Fake Data    | `@faker-js/faker` (for seeding)        |
| CORS         | `cors` middleware                       |
| Development  | VS Code, Git, WSL (Ubuntu), Postman     |


---

## Security Implementation Details

- **JWT Authentication**: On login, a JWT token is issued and stored in localStorage. All protected API requests require the token in the Authorization header. The backend verifies the token and user role for every request.
- **Role Checks**: Middleware on all backend routes ensures only users with the correct role can access/modify data (e.g., only admins can add users, only teachers can grade).
- **Input Validation & Sanitization**: All user input is validated (e.g., email format, password length, file type) and sanitized to prevent malicious input. Express-validator and custom middleware are used.
- **Password Hashing & Salting**: Passwords are hashed and salted using bcrypt before being stored in MongoDB. Passwords are never returned in API responses.
- **File Validation**: All file uploads are validated for allowed types (pdf, docx, jpg, png, zip, txt, doc) and size (max 10MB per file). Invalid files are rejected.
- **Sensitive Data**: Passwords and sensitive fields are never exposed in API responses. User data is filtered before sending to the frontend.
- **Environment Variables**: JWT secret and other sensitive config are stored in .env (not committed to repo).

---

### How to Get Started

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd student_grading_dashboard
   ```

2. **Install dependencies**

   Backend:
   ```bash
   cd backend
   npm install
   ```

   Frontend:
   ```bash
   cd ../frontend
   npm install
   ```

3. **Start MongoDB** (Ubuntu/WSL)

   ```bash
   # Make sure MongoDB is installed and running
   sudo systemctl start mongod
   sudo systemctl enable mongod   # optional: start on boot
   ```

   If it fails in WSL:
   ```bash
   sudo mkdir -p /data/db
   sudo chown -R $USER /data/db
   mongod --dbpath /data/db &
   ```

4. **Seed the database** (creates 1 admin, 5 teachers, 70 students, 10 courses)

   ```bash
   cd ../backend
   node seed.js
   ```

   You should see logs ending with:
   ```
   Seeded 70 students...
   Disconnected from MongoDB
   ```

5. **Run the backend server**

   In one terminal:
   ```bash
   cd backend
   node server.js
   ```
   → Server runs on `http://localhost:5000`

6. **Run the frontend**

   In another terminal:
   ```bash
   cd frontend
   npm start
   ```
   → Opens `http://localhost:3000` in your browser

---

### Default Login Credentials

| Role      | Email                     | Password     |
|-----------|---------------------------|--------------|
| Admin     | `admin@uni.com`           | `password123`|
| Any Teacher | (generated by seed)     | `password123`|
| Any Student | (generated by seed)     | `password123`|


After logging in, you’ll be redirected to your role-specific dashboard. All navigation and content are role-based and protected.

---

### Useful Bash Commands Summary

```bash
# Start MongoDB (WSL fallback)
mongod --dbpath /data/db &

# Seed database (run anytime to reset data)
cd backend && node seed.js

# Run backend
cd backend && node server.js

# Run frontend
cd frontend && npm start

# Stop everything (Ctrl+C in terminals, then)
pkill mongod   # optional cleanup
```


---

## Changelog (Final Version)

- Complete UI overhaul: modern light mode, card-based dashboard, responsive design
- Sidebar and header navigation for all roles
- JWT authentication and secure role-based access for all routes
- Input validation, sanitization, and file validation on backend
- Password hashing and salting (bcrypt)
- Secure file upload and download endpoints
- All sensitive data protected; no passwords in API responses
- Improved accessibility and user experience

---

Enjoy the dashboard!
