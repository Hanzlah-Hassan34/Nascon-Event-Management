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

![signup](https://github.com/user-attachments/assets/46711699-1ff8-4989-82ca-399a26d37674)

![Login](https://github.com/user-attachments/assets/cc61ebc9-eabb-4e30-9b93-cc77ab4fe15d)

![Home_1](https://github.com/user-attachments/assets/72b0d600-e2cb-44bb-9ea9-a638617be438)
![Home_2](https://github.com/user-attachments/assets/b242f063-1465-4c12-9e17-d0311677c70e)
![Home_3](https://github.com/user-attachments/assets/dfa89da9-1484-4c7a-a3be-d37cccf3232c)
![Home_5](https://github.com/user-attachments/assets/fd41dcb0-31be-47c2-b272-5b0bdb948fd9)
## Admin  

![admin1](https://github.com/user-attachments/assets/18e6ff2e-ccd4-42a0-a7f8-48b21c0f94a1)

![admin2](https://github.com/user-attachments/assets/3d46eafb-3d82-46f9-84fc-bbea04a5eb85)

![admin3](https://github.com/user-attachments/assets/43eb5b4e-2a92-41b0-a7e6-1100e3bc499f)

![admin4](https://github.com/user-attachments/assets/f158c074-9b9f-4706-9422-d7fa28cc3bbc)


![admin5](https://github.com/user-attachments/assets/e602b9f5-3c3b-4ba8-8b03-1a6ae7524869)
## Judge
![judge1](https://github.com/user-attachments/assets/8288ba28-beef-4eac-bd9e-32e909e073cc)

![judge2](https://github.com/user-attachments/assets/5a57737a-2565-4274-aa33-4283de133804)

![judge3](https://github.com/user-attachments/assets/70996a02-fcca-4077-ae1b-98bccabaf662)

## Participant

![participant1](https://github.com/user-attachments/assets/8395000a-443a-4ed0-aeee-0c2472384685)

![participant2](https://github.com/user-attachments/assets/7227b870-31f7-4c0c-9d06-f5db3b1bac48)

![participant3](https://github.com/user-attachments/assets/2e08201c-bad7-44a7-80cf-5de4b88e56eb)


### other roles are also but not mentinoed in sccreens here
## ERD 
![Final_ERD](https://github.com/user-attachments/assets/4d444064-179d-4fae-9f5b-92d4e438a29a)


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
