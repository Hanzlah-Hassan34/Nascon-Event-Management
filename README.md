# 🎉 NASCON Event Management System

A full-stack web application to streamline large-scale student convention management

# ✨ Features
✅ Role-based access control (Admin, Organizer, Judge, Sponsor, Participant)

✅ Secure user authentication with login/signup

✅ Admin Dashboard to:

View system overview

Manage all users and roles

Create, edit, and delete events

Access About NASCON information

✅ Event Management with:

Category-specific event creation (Tech, Business, Gaming, etc.)

Edit and update event details

Schedule rounds (Prelims, Semi-Finals, Finals)

✅ Venue Scheduling with overlap prevention using SQL constraints

✅ Participant Registration (individual or team)

✅ Automatic Accommodation Assignment based on availability & budget

✅ Sponsor Dashboard to view packages, make payments, and track promotions

✅ Judge Dashboard with event scoring, leaderboard, and winner declaration

✅ Analytics & Reports on revenue, participant demographics, venue usage

✅ RESTful APIs and dynamic frontend updates with JavaScript

✅ MySQL Database using views, joins, stored procedures, triggers

🛠️ Tech Stack
Frontend: HTML, CSS, JavaScript, Bootstrap

Backend: Node.js, Express.js

Database: MySQL

Authentication: Custom session-based logic

Hosting (optional): Node.js-compatible platforms (e.g., Render, Railway)

# 🖼️ Screenshots
Screenshots placeholders (add screenshots in these paths):

/screenshots/login.png – Login Page

/screenshots/admin-dashboard.png – Admin Panel

/screenshots/event-creation.png – Event Creation Form

/screenshots/judge-scoring.png – Judge Evaluation Interface

# 📁 Folder Structure

/
├── app.js                   # Main server file (Express app)

├── database.sql             # Complete MySQL schema

├── Final_ERD.drawio         # ERD design (editable)

├── Final_ERD.png            # ERD image

├── package.json             # Node.js dependencies

├── Packages                 # Hosting/deployment config

├── config/

│   └── database.js          # MySQL DB config

├── middleware/

│   └── auth.js              # Role-based access logic

├── public/

│   └── js/                  # Client-side JS

└── views/                   # HTML templates

    ├── index.html                   # Home
    
    ├── login.html                   # Login page
    
    ├── signup.html                  # User registration
    
    ├── admin-dashboard.html         # Admin panel
    
    ├── organizer-dashboard.html     # Event organizer panel
    
    ├── event-create.html            # Create new event
    
    ├── event-details.html           # Event info
    
    ├── event-edit.html              # Update event
    
    ├── participant-dashboard.html   # Participant view
    
    ├── sponsor-dashboard.html       # Sponsor interface
    
    ├── judge-dashboard.html         # Judge panel
    
    ├── judge-events.html            # Assigned events
    
    ├── judge-event-details.html     # Event detail view for judges
    
    ├── judge-score-event.html       # Scoring UI
    
    ├── judge-scoring.html           # Scoring overview
    
    ├── judge-profile.html           # Judge profile
    
# 🧠 Problem Statement & Motivation
NASCON is an annual national-level student convention hosting diverse competitions, workshops, and sessions across disciplines. Managing event logistics, registrations, sponsorships, accommodations, and judging manually for hundreds of participants is inefficient and error-prone.

This system was built to digitize and automate these processes — enhancing transparency, reducing overhead, and providing real-time access to all stakeholders.

# 🚀 How to Run the Project
Clone the repo

git clone https://github.com/yourusername/nascon-event-management.git
cd nascon-event-management
Install dependencies

npm install
Configure database

Import database.sql into your MySQL server

Update DB credentials in config/database.js

Start the server

node app.js
Open in browser

http://localhost:3000
# 👥 Team Contribution
Team Size: 3 Members
Your Role:

Backend & database design (ERD, schema, triggers, stored procedures)

Frontend templates for all user roles

Implemented full REST API and routing

Role-based authentication and access system

(You may list other members and their roles if applicable)

# 🎓 Course Information
Course: Database Systems Lab

Semester: Spring 2025

Institution: National University of Computer and Emerging Sciences (FAST-NUCES), Islamabad Campus

Instructors: Dr. Waseem Shahzad, Dr. Ramoza Ahsan, Ms. Kainat Iqbal

Lab Instructors: Mr. Ali Hamza, Ms. Sidra Fayyaz, Mr. Abdul Wahab

# 📜 License
This project is for academic use only. Contact the author if you'd like to reuse or extend it.
