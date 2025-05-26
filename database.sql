drop database iteration_2;
create database iteration_2;
use iteration_2;
CREATE TABLE SponsorshipPackage (
    PackageID INT AUTO_INCREMENT PRIMARY KEY,
    PackageName VARCHAR(100) NOT NULL,
    Description TEXT,
    Benefits TEXT,
    Amount DECIMAL(10,2) NOT NULL,
    CONSTRAINT chk_pkg_amount CHECK (Amount > 0)
);

-- table of user
CREATE TABLE _USER (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    MiddleName VARCHAR(50),
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    City VARCHAR(100) NOT NULL,
    CHECK (Email LIKE '%_@__%.__%'),
    CHECK (FirstName NOT LIKE '%[^a-zA-Z]%'),
    CHECK (MiddleName IS NULL OR MiddleName NOT LIKE '%[^a-zA-Z ]%'),
    CHECK (LastName NOT LIKE '%[^a-zA-Z]%')
);
CREATE TABLE currentLogin (
    loginID INT AUTO_INCREMENT PRIMARY KEY,
    id INT,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE USER_PHONE_NUMBER (
    UserID INT,
    PhoneNumber VARCHAR(20),
    CHECK (PhoneNumber NOT LIKE '%[^0-9]%' AND LENGTH(PhoneNumber) = 11),
    CONSTRAINT FK FOREIGN KEY (UserID) REFERENCES _USER(UserID),
    CONSTRAINT PK PRIMARY KEY (UserID, PhoneNumber)
);

CREATE TABLE Admin (
    AdminID INT PRIMARY KEY,
    DateAssigned DATE NOT NULL,
    Privileges TEXT,
    FOREIGN KEY (AdminID) REFERENCES _USER(UserID)
);

CREATE TABLE EventOrganizer (
    OrganizerID INT PRIMARY KEY,
    Experience FLOAT NOT NULL,
    FOREIGN KEY (OrganizerID) REFERENCES _USER(UserID)
);

CREATE TABLE Judge (
    JudgeID INT PRIMARY KEY,
    Expertise VARCHAR(100),
    FOREIGN KEY (JudgeID) REFERENCES _USER(UserID)
);

CREATE TABLE Judge_Expertise (
    JudgeID INT,
    Expertise_Domain VARCHAR(255) NOT NULL,
    FOREIGN KEY (JudgeID) REFERENCES Judge(JudgeID),
    CONSTRAINT PK PRIMARY KEY (JudgeID, Expertise_Domain)
);

CREATE TABLE Team (
    TeamID INT AUTO_INCREMENT PRIMARY KEY,
    TeamName VARCHAR(100) NOT NULL
);

CREATE TABLE Participant (
    ParticipantID INT PRIMARY KEY,
    TeamID INT NOT NULL,
    University VARCHAR(100),
    FOREIGN KEY (ParticipantID) REFERENCES _USER(UserID),
    FOREIGN KEY (TeamID) REFERENCES Team(TeamID)
);

CREATE TABLE Accommodation (
    BedNO INT AUTO_INCREMENT,
    RoomNumber VARCHAR(20) NOT NULL,
    CheckInDate DATETIME NOT NULL,
    CheckOutDate DATETIME NOT NULL,
    ParticipantID INT NOT NULL,
    PRIMARY KEY (BedNO),
    FOREIGN KEY (ParticipantID) REFERENCES Participant(ParticipantID),
    CONSTRAINT chk_dates CHECK (CheckOutDate > CheckInDate)
);

CREATE TABLE Venue (
    VenueID INT AUTO_INCREMENT PRIMARY KEY,
    VenueName VARCHAR(100) NOT NULL,
    Status VARCHAR(50) NOT NULL,
    Location VARCHAR(255) NOT NULL,
    Capacity INT NOT NULL,
    CONSTRAINT chk_capacity CHECK (Capacity > 0)
);

CREATE TABLE Event (
    EventID INT AUTO_INCREMENT PRIMARY KEY,
    EventName VARCHAR(100) NOT NULL,
    Description TEXT,
    Rules TEXT,
    Category ENUM('Tech Events', 'Business Competitions', 'Gaming Tournaments', 'General Events') NOT NULL,
    RegistrationFee DECIMAL(10,2) NOT NULL,
    MaxParticipants INT NOT NULL,
    OrganizerID INT NOT NULL,
    FOREIGN KEY (OrganizerID) REFERENCES EventOrganizer(OrganizerID),
    CONSTRAINT chk_fee CHECK (RegistrationFee >= 0),
    CONSTRAINT chk_maxparticipants CHECK (MaxParticipants > 0)
);
CREATE TABLE JudgeEvent (
    JudgeID INT,
    EventID INT,
    AssignDate DATE NOT NULL DEFAULT now(),
    PRIMARY KEY (JudgeID, EventID),
    FOREIGN KEY (JudgeID) REFERENCES Judge(JudgeID),
    FOREIGN KEY (EventID) REFERENCES Event(EventID)
);


CREATE TABLE EventParticipation (
    ParticipantID INT,
    EventID INT,
    RegistrationDateTime DATETIME NOT NULL,
    PRIMARY KEY (ParticipantID, EventID),
    FOREIGN KEY (ParticipantID) REFERENCES Participant(ParticipantID),
    FOREIGN KEY (EventID) REFERENCES Event(EventID)
);

CREATE TABLE EventVenue (
    EventID INT,
    VenueID INT,
    EventDateTime DATETIME NOT NULL,
    PRIMARY KEY (EventID, VenueID),
    FOREIGN KEY (EventID) REFERENCES Event(EventID),
    FOREIGN KEY (VenueID) REFERENCES Venue(VenueID)
);

CREATE TABLE Sponsor (
    SponsorID INT AUTO_INCREMENT PRIMARY KEY,
    SponsorName VARCHAR(100) NOT NULL,
    CompanyName VARCHAR(100) NOT NULL,
    ContractDetail TEXT,
	FOREIGN KEY (SponsorID) REFERENCES _USER(UserID)

);

CREATE TABLE Sponsorship (
    SponsorshipID INT AUTO_INCREMENT PRIMARY KEY,
    SponsorID INT NOT NULL,
    ContractDetails TEXT,
    PackageID INT,
	PurchaseDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PaymentStatus ENUM('Pending', 'Completed', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending',
    FOREIGN KEY (SponsorID) REFERENCES Sponsor(SponsorID),
	FOREIGN KEY (PackageID) REFERENCES SponsorshipPackage(PackageID)

);

CREATE TABLE Payment (
    PaymentID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    PaymentDate DATETIME NOT NULL,
    PaymentMethod VARCHAR(50) NOT NULL,
    Status VARCHAR(50) NOT NULL,
    FOREIGN KEY (UserID) REFERENCES _USER(UserID),
    CONSTRAINT chk_payment_amount CHECK (Amount > 0)
);

CREATE TABLE Evaluation (
    EvaluationID INT AUTO_INCREMENT PRIMARY KEY,
    EventID INT NOT NULL,
    ParticipantID INT NOT NULL,
    JudgeID INT NOT NULL,
    Score DECIMAL(5,2) NOT NULL,
    RoundName VARCHAR(50) NOT NULL,
    FOREIGN KEY (EventID) REFERENCES Event(EventID),
    FOREIGN KEY (ParticipantID) REFERENCES Participant(ParticipantID),
    FOREIGN KEY (JudgeID) REFERENCES Judge(JudgeID),
    CONSTRAINT chk_score CHECK (Score >= 0)
);

INSERT INTO SponsorshipPackage (PackageName, Description, Benefits, Amount) VALUES
('Platinum Sponsor', 'Main event branding with maximum visibility', 'Logo on all materials, VIP access, premium booth location, speaking opportunity', 100000.00),
('Gold Sponsor', 'High visibility sponsorship package', 'Logo on all materials, sponsor mention, standard booth', 50000.00),
('Silver Sponsor', 'Medium visibility package', 'Logo on digital materials, sponsor mention, small booth', 25000.00),
('Bronze Sponsor', 'Basic visibility package', 'Logo on website, sponsor mention in program', 10000.00),
('Media Partner', 'Coverage and promotion partnership', 'Cross-promotion, media coverage, content sharing', 30000.00);

insert into _user (firstname, middlename, lastname, email, password, city) values
('Hanzlah', '', 'Hassan', 'admin1@example.com', 'admin1', 'Sargodha'),
('Ayesha', '', 'Khan', 'admin2@example.com', 'admin2', 'Islamabad'),
('Bilal', 'Ahmed', 'Sheikh', 'organizer1@example.com', 'org123', 'Lahore'),
('Mehwish', '', 'Iqbal', 'organizer2@example.com', 'org456', 'Karachi'),
('Zubair', 'Ali', 'Raja', 'organizer3@example.com', 'org789', 'Rawalpindi'),
('Bilal', 'Ahmed', 'Sheikh', 'organizer4@example.com', 'org123', 'Lahore'),
('Mehwish', '', 'Iqbal', 'organizer5@example.com', 'org456', 'Karachi'),
('Zubair', 'Ali', 'Raja', 'organizer6@example.com', 'org789', 'Rawalpindi'),
('Usman', '', 'Tariq', 'participant1@example.com', 'pass1', 'Faisalabad'),
('Nimra', '', 'Saeed', 'participant2@example.com', 'pass2', 'Multan'),
('Daniyal', '', 'Asif', 'participant3@example.com', 'pass3', 'Peshawar'),
('Laiba', 'Zahid', 'Malik', 'participant4@example.com', 'pass4', 'Gujranwala'),
('Shahzaib', 'Riaz', 'Butt', 'participant5@example.com', 'pass5', 'Hyderabad'),
('Raza', 'Riaz', 'Butt', 'participant6@example.com', 'pass6', 'Multan'),
('Adeel', '', 'Rehman', 'judge1@example.com', 'judge1pass', 'Lahore'),
('Sadia', 'Ali', 'Naseer', 'judge2@example.com', 'judge2pass', 'Karachi'),
('Farhan', '', 'Zahid', 'judge3@example.com', 'judge3pass', 'Islamabad'),
('Hira', 'Aslam', 'Khan', 'judge4@example.com', 'judge4pass', 'Peshawar'),
('Tariq', '', 'Mehmood', 'sponsor1@example.com', 'sponsor1pass', 'Lahore'),
('Sana', 'Ahmed', 'Rauf', 'sponsor2@example.com', 'sponsor2pass', 'Karachi'),
('Bilal', '', 'Hashmi', 'sponsor3@example.com', 'sponsor3pass', 'Faisalabad'),
('Nida', '', 'Qureshi', 'sponsor4@example.com', 'sponsor4pass', 'Multan'),
('Usman', 'Raza', 'Khan', 'sponsor5@example.com', 'sponsor5pass', 'Quetta');


-- user phone numbers
insert into user_phone_number values ((select userid from _user where email='admin1@example.com'), '03001234567');
insert into user_phone_number values ((select userid from _user where email='admin2@example.com'), '03011234567');
insert into user_phone_number values ((select userid from _user where email='organizer1@example.com'), '03021234567');
insert into user_phone_number values ((select userid from _user where email='organizer2@example.com'), '03031234567');
insert into user_phone_number values ((select userid from _user where email='organizer3@example.com'), '03041234567');
insert into user_phone_number values ((select userid from _user where email='participant1@example.com'), '03051234567');
insert into user_phone_number values ((select userid from _user where email='participant2@example.com'), '03061234567');
insert into user_phone_number values ((select userid from _user where email='participant3@example.com'), '03071234567');
insert into user_phone_number values ((select userid from _user where email='participant4@example.com'), '03081234567');
insert into user_phone_number values ((select userid from _user where email='participant5@example.com'), '03091234567');
insert into user_phone_number values ((select userid from _user where email='participant6@example.com'), '03101234567');
insert into user_phone_number values ((select userid from _user where email='judge1@example.com'), '03111234567');
insert into user_phone_number values ((select userid from _user where email='judge2@example.com'), '03121234567');
insert into user_phone_number values ((select userid from _user where email='judge3@example.com'), '03131234567');
insert into user_phone_number values ((select userid from _user where email='judge4@example.com'), '03141234567');

-- admins
insert into admin (adminid, dateassigned, privileges) values ((select userid from _user where email='admin1@example.com'), current_date, 'can manage system');
insert into admin (adminid, dateassigned, privileges) values ((select userid from _user where email='admin2@example.com'), current_date, 'can edit event and user data');
select * from eventorganizer;
-- organizers
insert into eventorganizer (organizerid, experience) values ((select userid from _user where email='organizer1@example.com'), 2.5);
insert into eventorganizer (organizerid, experience) values ((select userid from _user where email='organizer2@example.com'), 4.0);
insert into eventorganizer (organizerid, experience) values ((select userid from _user where email='organizer3@example.com'), 3.2);
insert into eventorganizer (organizerid, experience) values ((select userid from _user where email='organizer4@example.com'), 2.5);
insert into eventorganizer (organizerid, experience) values ((select userid from _user where email='organizer5@example.com'), 4.0);
insert into eventorganizer (organizerid, experience) values ((select userid from _user where email='organizer6@example.com'), 3);




select * from currentlogin;
-- judges
insert into judge (judgeid, expertise) values ((select userid from _user where email='judge1@example.com'), 'ai');
insert into judge (judgeid, expertise) values ((select userid from _user where email='judge2@example.com'), 'cybersecurity');
insert into judge (judgeid, expertise) values ((select userid from _user where email='judge3@example.com'), 'startup pitching');
insert into judge (judgeid, expertise) values ((select userid from _user where email='judge4@example.com'), 'debating');

-- judge expertise
insert into judge_expertise values ((select userid from _user where email='judge1@example.com'), 'ai/ml');
insert into judge_expertise values ((select userid from _user where email='judge2@example.com'), 'marketing');
insert into judge_expertise values ((select userid from _user where email='judge3@example.com'), 'esports');
insert into judge_expertise values ((select userid from _user where email='judge4@example.com'), 'public speaking');

-- events
insert into event (eventname, description, rules, category, registrationfee, maxparticipants, organizerid)
values ('hackathon', 'coding challenge', 'no plagiarism', 'tech events', 500.00, 100, (select userid from _user where email='organizer2@example.com'));

insert into event (eventname, description, rules, category, registrationfee, maxparticipants, organizerid)
values ('bizquiz', 'business quiz', 'no teams allowed', 'business competitions', 300.00, 50, (select userid from _user where email='organizer3@example.com'));

insert into event (eventname, description, rules, category, registrationfee, maxparticipants, organizerid)
values ('fifa showdown', 'console gaming', 'no cheating', 'gaming tournaments', 200.00, 32, (select userid from _user where email='organizer4@example.com'));

insert into event (eventname, description, rules, category, registrationfee, maxparticipants, organizerid)
values ('debate comp.', 'debate rules', 'no personal attacks', 'general events', 150.00, 20, (select userid from _user where email='organizer5@example.com'));

insert into event (eventname, description, rules, category, registrationfee, maxparticipants, organizerid)
values ('startup pitch', 'pitch your startup', 'original ideas only', 'business competitions', 400.00, 40, (select userid from _user where email='organizer1@example.com'));

-- teams
insert into team (teamname )values ('team alpha');
insert into team (teamname )values ('team a');

insert into team (teamname) values ('team bravo');
insert into team (teamname) values ('team charlie');
insert into team (teamname) values ('team delta');
insert into team (teamname) values ('team echo');


-- participants
insert into participant (participantid, teamid, university) values
((select userid from _user where email='participant1@example.com'), (select teamid from team where teamname='team a'), 'pu lahore');

insert into participant (participantid, teamid, university) values
((select userid from _user where email='participant2@example.com'), (select teamid from team where teamname='team alpha'), 'pu lahore');

insert into participant (participantid, teamid, university) values
((select userid from _user where email='participant3@example.com'), (select teamid from team where teamname='team bravo'), 'fast islamabad');

insert into participant (participantid, teamid, university) values
((select userid from _user where email='participant4@example.com'), (select teamid from team where teamname='team bravo'), 'comsats abbottabad');

insert into participant (participantid, teamid, university) values
((select userid from _user where email='participant5@example.com'), (select teamid from team where teamname='team charlie'), 'nust islamabad');

insert into participant (participantid, teamid, university) values
((select userid from _user where email='participant6@example.com'), (select teamid from team where teamname='team echo'), 'giki');

-- accommodation
insert into accommodation (roomnumber, CheckInDate, checkoutdate, ParticipantID) values
('r1', '2025-05-01 14:00:00', '2025-06-04 12:00:00', (select userid from _user where email='participant2@example.com'));

insert into accommodation (roomnumber,CheckInDate, checkoutdate, ParticipantID) values
('r2', '2025-05-01 15:00:00', '2025-06-04 12:00:00', (select userid from _user where email='participant3@example.com'));

insert into accommodation (roomnumber, CheckInDate, checkoutdate, ParticipantID) values
('r3', '2025-05-01 16:00:00', '2025-06-04 12:00:00', (select userid from _user where email='participant4@example.com'));

insert into accommodation (roomnumber, CheckInDate, checkoutdate, ParticipantID) values
('r4', '2025-05-01 17:00:00', '2025-06-04 12:00:00', (select userid from _user where email='participant5@example.com'));

-- venues
insert into venue (venuename, status, Location, capacity) values
('auditorium a', 'available', 'a-block', 300),
('lab block', ' available', 'a-block', 100),
('main hall', ' available', 'b-block', 200),
('open ground', 'available', 'd-block', 500),
('auditorium b', 'available', 'c-block', 250),
('conference room 1', 'available', 'e-block', 80),
('seminar hall', 'available', 'f-block', 120),
('innovation lab', 'available', 'g-block', 60),
('tech zone', 'available', 'h-block', 150),
('exhibition area', 'available', 'i-block', 400);


-- sponsors
insert into sponsor (sponsorid, sponsorname, companyname, contractdetail) values
((select userid from _user where email = 'sponsor1@example.com'), 'ptcl', 'ptcl ltd', 'annual support for tech events'),
((select userid from _user where email = 'sponsor2@example.com'), 'pepsi', 'pepsico', 'refreshment contract'),
((select userid from _user where email = 'sponsor3@example.com'), 'nestle', 'nestle pakistan', 'water bottles sponsor'),
((select userid from _user where email = 'sponsor4@example.com'), 'ary news', 'ary group', 'live media coverage'),
((select userid from _user where email = 'sponsor5@example.com'), 'jazz', 'jazz telecom', 'internet support');

INSERT INTO sponsorship (sponsorid,  PackageID,contractdetails, purchasedate ,paymentstatus) VALUES
((SELECT sponsorid FROM sponsor WHERE companyname = 'ptcl ltd'), 1,'Annual support for tech events', '2025-04-15 10:00:00', 'Completed');

INSERT INTO sponsorship (sponsorid, PackageID,contractdetails, purchasedate, paymentstatus) VALUES
((SELECT sponsorid FROM sponsor WHERE companyname = 'pepsico'), 2,'Refreshment contract', '2025-04-16 11:30:00', 'Completed');

INSERT INTO sponsorship (sponsorid, PackageID,contractdetails, purchasedate, paymentstatus) VALUES
((SELECT sponsorid FROM sponsor WHERE companyname = 'nestle pakistan'), 3,'Water bottles sponsor', '2025-04-17 09:15:00', 'Completed');

INSERT INTO sponsorship (sponsorid, PackageID,contractdetails, purchasedate, paymentstatus) VALUES
((SELECT sponsorid FROM sponsor WHERE companyname = 'ary group'), 2,'Live media coverage', '2025-04-18 14:45:00', 'Completed');

INSERT INTO sponsorship (sponsorid, PackageID,contractdetails, purchasedate, paymentstatus) VALUES
((SELECT sponsorid FROM sponsor WHERE companyname = 'jazz telecom'), 1,'Internet support', '2025-04-19 16:30:00', 'Completed');

insert into evaluation (eventid, participantid, judgeid, score, roundname) values
(
  (select eventid from event where eventname = 'hackathon'),
  (select participantid from participant where participantid = (select userid from _user where email = 'participant1@example.com')),
  (select judgeid from judge where judgeid = (select userid from _user where email = 'judge1@example.com')),
  85.50,
  'round 1'
);

insert into evaluation (eventid, participantid, judgeid, score, roundname) values
(
  (select eventid from event where eventname = 'bizquiz'),
  (select participantid from participant where participantid = (select userid from _user where email = 'participant2@example.com')),
  (select judgeid from judge where judgeid = (select userid from _user where email = 'judge2@example.com')),
  90.00,
  'round 1'
);
select * from event;
insert into eventvenue (eventid, venueid, eventdateTime) values
(1, 1, '2025-06-28 10:00:00'),
(2, 2, '2025-06-28 11:00:00'),
(3, 3, '2025-06-28 12:00:00'),
(4, 4, '2025-06-28 13:00:00'),
(5, 5, '2025-06-28 14:00:00');
insert into eventparticipation (participantid, eventid, registrationdatetime) values
(10, 2, '2025-06-20 09:00:00'),
(10, 1, '2025-06-20 09:00:00'),
(11, 3, '2025-06-21 10:00:00'),
(12, 4, '2025-06-22 11:00:00');
  --   
  INSERT INTO JudgeEvent (JudgeID, EventID) 
VALUES 
(16, 1),  
(16, 2), 
(16, 3);
-- Trigger to handle organizer deletion by first updating or deleting related events
DELIMITER //
CREATE TRIGGER before_organizer_delete
BEFORE DELETE ON EventOrganizer
FOR EACH ROW
BEGIN
    
    DELETE FROM EventVenue 
    WHERE EventID IN (SELECT EventID FROM Event WHERE OrganizerID = OLD.OrganizerID);
    
    -- Delete EventParticipation entries
    DELETE FROM EventParticipation 
    WHERE EventID IN (SELECT EventID FROM Event WHERE OrganizerID = OLD.OrganizerID);
    
    -- Delete JudgeEvent entries
    DELETE FROM JudgeEvent
    WHERE EventID IN (SELECT EventID FROM Event WHERE OrganizerID = OLD.OrganizerID);
    
    -- Delete Evaluation entries
    DELETE FROM Evaluation
    WHERE EventID IN (SELECT EventID FROM Event WHERE OrganizerID = OLD.OrganizerID);
    
    -- Finally delete the events themselves
    DELETE FROM Event WHERE OrganizerID = OLD.OrganizerID;
END //
DELIMITER ;

-- Trigger to handle user deletion by triggering role deletion
DELIMITER //
CREATE TRIGGER before_user_delete
BEFORE DELETE ON _USER
FOR EACH ROW
BEGIN
    DELETE FROM Admin WHERE AdminID = OLD.UserID;
    DELETE FROM EventOrganizer WHERE OrganizerID = OLD.UserID;
    DELETE FROM Judge WHERE JudgeID = OLD.UserID;
    DELETE FROM Participant WHERE ParticipantID = OLD.UserID;
    DELETE FROM Sponsor WHERE SponsorID = OLD.UserID;
    
    DELETE FROM USER_PHONE_NUMBER WHERE UserID = OLD.UserID;
    
    DELETE FROM Sponsorship WHERE SponsorID = OLD.UserID;
    
    DELETE FROM EventParticipation WHERE ParticipantID = OLD.UserID;
    DELETE FROM Evaluation WHERE ParticipantID = OLD.UserID;
    
    DELETE FROM Evaluation WHERE JudgeID = OLD.UserID;
    DELETE FROM JudgeEvent WHERE JudgeID = OLD.UserID;
END //
DELIMITER ;
ALTER TABLE Event 
DROP FOREIGN KEY event_ibfk_1;

-- Re-add the foreign key with CASCADE option
ALTER TABLE Event 
ADD CONSTRAINT event_ibfk_1 
FOREIGN KEY (OrganizerID) REFERENCES EventOrganizer(OrganizerID)
ON DELETE CASCADE;

ALTER TABLE EventParticipation 
DROP FOREIGN KEY eventparticipation_ibfk_1;

ALTER TABLE EventParticipation 
ADD CONSTRAINT eventparticipation_ibfk_1 
FOREIGN KEY (EventID) REFERENCES Event(EventID)
ON DELETE CASCADE;

ALTER TABLE EventVenue 
DROP FOREIGN KEY eventvenue_ibfk_1;

ALTER TABLE EventVenue 
ADD CONSTRAINT eventvenue_ibfk_1 
FOREIGN KEY (EventID) REFERENCES Event(EventID)
ON DELETE CASCADE;

ALTER TABLE JudgeEvent 
DROP FOREIGN KEY judgeevent_ibfk_1;

ALTER TABLE JudgeEvent 
ADD CONSTRAINT judgeevent_ibfk_1 
FOREIGN KEY (EventID) REFERENCES Event(EventID)
ON DELETE CASCADE;

-- Ensure Evaluation cascades when Event is deleted
ALTER TABLE Evaluation 
DROP FOREIGN KEY evaluation_ibfk_1;

ALTER TABLE Evaluation 
ADD CONSTRAINT evaluation_ibfk_1 
FOREIGN KEY (EventID) REFERENCES Event(EventID)
ON DELETE CASCADE;

ALTER TABLE Sponsorship
DROP FOREIGN KEY sponsorship_ibfk_1;
ALTER TABLE Sponsorship
ADD CONSTRAINT sponsorship_ibfk_1
FOREIGN KEY (SponsorID) REFERENCES Sponsor(SponsorID)
ON DELETE CASCADE;


ALTER TABLE USER_PHONE_NUMBER
ADD CONSTRAINT user_phone_number_ibfk_1
FOREIGN KEY (UserID) REFERENCES _USER(UserID)
ON DELETE CASCADE;

INSERT INTO JudgeEvent (JudgeID, EventID, AssignDate) 
VALUES 
(16, 4, CURRENT_DATE()),  -- Debate Comp.
(16, 5, CURRENT_DATE());  -- Startup Pitch

-- 3. Add more judges to events if needed (optional)
INSERT INTO JudgeEvent (JudgeID, EventID, AssignDate) 
VALUES 
(17, 1, CURRENT_DATE()), 
(18, 2, CURRENT_DATE());  


SELECT * FROM EventParticipation WHERE EventID IN (1, 2, 3, 4, 5);

INSERT INTO EventParticipation (ParticipantID, EventID, RegistrationDateTime) 
VALUES
(9, 1, '2025-05-20 09:00:00'),  -- Participant 9 for EventID 1
(9, 2, '2025-05-21 10:00:00'),  -- Participant 9 for EventID 2
(11, 4, '2025-05-23 12:00:00'), -- Participant 11 for EventID 4
(12, 5, '2025-05-24 13:00:00'), -- Participant 12 for EventID 5
(13, 1, '2025-05-25 14:00:00'), -- Participant 13 for EventID 1 
(14, 2, '2025-05-26 15:00:00'); -- Participant 14 for EventID 2

INSERT INTO Evaluation (EventID, ParticipantID, JudgeID, Score, RoundName) 
VALUES
(1, 9, 16, 8.5, 'Round 1'),   -- Participant 9 in Event 1 scored by Judge 16
(2, 10, 16, 7.0, 'Round 1'),  -- Participant 10 in Event 2 scored by Judge 16
(3, 11, 16, 9.0, 'Round 1');  -- Participant 11 in Event 3 scored by Judge 16



INSERT INTO currentLogin (id, name) 
VALUES (16, 'Sadia Ali Naseer');



ALTER TABLE Evaluation
ADD COLUMN Comments TEXT;

UPDATE Evaluation 
SET Comments = 'Excellent understanding of concepts and great implementation'
WHERE EventID = 1 AND ParticipantID = 9 AND JudgeID = 16;

UPDATE Evaluation 
SET Comments = 'Good presentation but needs more depth'
WHERE EventID = 2 AND ParticipantID = 10 AND JudgeID = 16;

UPDATE Evaluation 
SET Comments = 'Outstanding performance, very creative solution'
WHERE EventID = 3 AND ParticipantID = 11 AND JudgeID = 16;


use iteration_2;

DELIMITER //

CREATE PROCEDURE GetParticipantDetails(IN p_participantId INT)
BEGIN
    SELECT 
        u.UserID, 
        u.FirstName, 
        u.MiddleName, 
        u.LastName, 
        u.Email, 
        u.city,
        p.University, 
        t.TeamName, 
        ep.RegistrationDateTime as RegistrationDate,
        GROUP_CONCAT(DISTINCT pn.PhoneNumber SEPARATOR ', ') as PhoneNumber
    FROM _USER u
    JOIN Participant p ON u.UserID = p.ParticipantID
    LEFT JOIN Team t ON p.TeamID = t.TeamID
    LEFT JOIN EventParticipation ep ON p.ParticipantID = ep.ParticipantID
    LEFT JOIN USER_PHONE_NUMBER pn ON u.UserID = pn.UserID
    WHERE u.UserID = p_participantId
    GROUP BY 
        u.UserID;
  
        

    
    
END //

DELIMITER ;
-- trigger

DELIMITER //
CREATE TRIGGER after_payment_submission
AFTER INSERT ON Payment
FOR EACH ROW
BEGIN
    UPDATE Payment
    SET Status = 'Paid', 
        PaymentDate = CURRENT_TIMESTAMP
    WHERE PaymentID = NEW.PaymentID
    AND (Status IS NULL OR Status = 'Pending');
    
    IF EXISTS (
        SELECT 1 FROM EventParticipation 
        WHERE ParticipantID = NEW.UserID
    ) THEN
        UPDATE EventParticipation
        SET PaymentConfirmed = 1  
        WHERE ParticipantID = NEW.UserID
        ORDER BY RegistrationDateTime DESC
        LIMIT 1;
    END IF;
END //
DELIMITER ;
-- additional data
insert into _user (firstname, middlename, lastname, email, password, city) values
('Imran', '', 'Rafiq', 'participant27@example.com', 'pass27', 'Lahore'),
('Yusra', '', 'Hameed', 'participant28@example.com', 'pass28', 'Karachi'),
('Talha', 'Irfan', 'Mughal', 'participant29@example.com', 'pass29', 'Multan'),
('Hiba', '', 'Rasheed', 'participant30@example.com', 'pass30', 'Faisalabad'),
('Faizan', '', 'Anwar', 'participant31@example.com', 'pass31', 'Sialkot'),
('Zarish', 'Noor', 'Ali', 'participant32@example.com', 'pass32', 'Rawalpindi'),
('Suleman', '', 'Akram', 'participant33@example.com', 'pass33', 'Gujranwala'),
('Aiman', '', 'Hanif', 'participant34@example.com', 'pass34', 'Quetta'),
('Adeel', '', 'Bashir', 'participant35@example.com', 'pass35', 'Peshawar'),
('Alishba', '', 'Sultan', 'participant36@example.com', 'pass36', 'Hyderabad'),
('Rayan', '', 'Tariq', 'participant37@example.com', 'pass37', 'Sargodha'),
('Kiran', '', 'Zaman', 'participant38@example.com', 'pass38', 'Sahiwal'),
('Sarmad', '', 'Rasheed', 'participant39@example.com', 'pass39', 'Abbottabad'),
('Aqsa', 'Naeem', 'Chaudhry', 'participant40@example.com', 'pass40', 'Mardan'),
('Furqan', '', 'Naeem', 'participant41@example.com', 'pass41', 'Kasur'),
('Minahil', '', 'Ijaz', 'participant42@example.com', 'pass42', 'Mirpur'),
('Haris', '', 'Javed', 'participant43@example.com', 'pass43', 'Jhelum'),
('Shanzay', 'Riaz', 'Sheikh', 'participant44@example.com', 'pass44', 'Bahawalpur'),
('Sameer', '', 'Siddiq', 'participant45@example.com', 'pass45', 'Larkana'),
('Tania', '', 'Sohail', 'participant46@example.com', 'pass46', 'Skardu');

-- jkhkjdwghdgfwehjgfhjwfg
insert into _user (firstname, middlename, lastname, email, password, city) values
('Areeba', '', 'Khan', 'participant7@example.com', 'pass7', 'Lahore'),
('Bilal', '', 'Ahmed', 'participant8@example.com', 'pass8', 'Karachi'),
('Hassan', 'Ali', 'Shah', 'participant9@example.com', 'pass9', 'Rawalpindi'),
('Sana', 'Tariq', 'Iqbal', 'participant10@example.com', 'pass10', 'Islamabad'),
('Taimoor', '', 'Khan', 'participant11@example.com', 'pass11', 'Quetta'),
('Aleena', 'Fatima', 'Sheikh', 'participant12@example.com', 'pass12', 'Sialkot'),
('Zain', '', 'Akhtar', 'participant13@example.com', 'pass13', 'Bahawalpur'),
('Maham', '', 'Zubair', 'participant14@example.com', 'pass14', 'Sargodha'),
('Hamza', 'Nadeem', 'Malik', 'participant15@example.com', 'pass15', 'Abbottabad'),
('Fatima', '', 'Aslam', 'participant16@example.com', 'pass16', 'Mirpur'),
('Saad', 'Bin', 'Nasir', 'participant17@example.com', 'pass17', 'Gujrat'),
('Komal', 'Bano', 'Riaz', 'participant18@example.com', 'pass18', 'Jhelum'),
('Noman', '', 'Yousaf', 'participant19@example.com', 'pass19', 'Rahim Yar Khan'),
('Iqra', 'Saleem', 'Abbasi', 'participant20@example.com', 'pass20', 'Mardan'),
('Ahsan', '', 'Mehmood', 'participant21@example.com', 'pass21', 'Sahiwal'),
('Zoya', 'Iftikhar', 'Hussain', 'participant22@example.com', 'pass22', 'Okara'),
('Waleed', 'Rehman', 'Kiani', 'participant23@example.com', 'pass23', 'Skardu'),
('Amna', '', 'Sharif', 'participant24@example.com', 'pass24', 'Larkana'),
('Faraz', 'Ullah', 'Jan', 'participant25@example.com', 'pass25', 'Mingora'),
('Mehak', '', 'Khalid', 'participant26@example.com', 'pass26', 'Kasur');

insert into _user (firstname, middlename, lastname, email, password, city) values
('Ali', 'Zafar', 'Shah', 'judge5@example.com', 'judge5pass', 'Karachi'),
('Sara', 'Ahmed', 'Raza', 'judge6@example.com', 'judge6pass', 'Lahore'),
('Usman', 'Tariq', 'Mir', 'judge7@example.com', 'judge7pass', 'Islamabad'),
('Nida', 'Faisal', 'Jamil', 'judge8@example.com', 'judge8pass', 'Quetta'),
('Farhan', 'Iqbal', 'Syed', 'judge9@example.com', 'judge9pass', 'Rawalpindi'),
('Zainab', 'Kamal', 'Rizvi', 'judge10@example.com', 'judge10pass', 'Multan'),
('Adeel', 'Nasir', 'Qureshi', 'judge11@example.com', 'judge11pass', 'Faisalabad'),
('Mehak', 'Ali', 'Nawaz', 'judge12@example.com', 'judge12pass', 'Hyderabad'),
('Bilal', 'Shahid', 'Kiani', 'judge13@example.com', 'judge13pass', 'Sialkot');

insert into user_phone_number values ((select userid from _user where email='participant7@example.com'), '03211234567');
insert into user_phone_number values ((select userid from _user where email='participant7@example.com'), '03451234567');
insert into user_phone_number values ((select userid from _user where email='participant8@example.com'), '03021234567');
insert into user_phone_number values ((select userid from _user where email='participant8@example.com'), '03031234567');
insert into user_phone_number values ((select userid from _user where email='participant9@example.com'), '03111234567');
insert into user_phone_number values ((select userid from _user where email='participant9@example.com'), '03201234567');
insert into user_phone_number values ((select userid from _user where email='participant10@example.com'), '03311234567');
insert into user_phone_number values ((select userid from _user where email='participant10@example.com'), '03411234567');
insert into user_phone_number values ((select userid from _user where email='participant11@example.com'), '03041234567');
insert into user_phone_number values ((select userid from _user where email='participant11@example.com'), '03051234568');
insert into user_phone_number values ((select userid from _user where email='participant12@example.com'), '03121234567');
insert into user_phone_number values ((select userid from _user where email='participant12@example.com'), '03221234567');
insert into user_phone_number values ((select userid from _user where email='participant13@example.com'), '03061234567');
insert into user_phone_number values ((select userid from _user where email='participant13@example.com'), '03061234568');
insert into user_phone_number values ((select userid from _user where email='participant14@example.com'), '03321234567');
insert into user_phone_number values ((select userid from _user where email='participant14@example.com'), '03421234567');
insert into user_phone_number values ((select userid from _user where email='participant15@example.com'), '03511234567');
insert into user_phone_number values ((select userid from _user where email='participant15@example.com'), '03611234567');
insert into user_phone_number values ((select userid from _user where email='participant16@example.com'), '03081234567');
insert into user_phone_number values ((select userid from _user where email='participant16@example.com'), '03091234567');
insert into user_phone_number values ((select userid from _user where email='participant17@example.com'), '03011234567');
insert into user_phone_number values ((select userid from _user where email='participant17@example.com'), '03011234568');
insert into user_phone_number values ((select userid from _user where email='participant18@example.com'), '03131234567');
insert into user_phone_number values ((select userid from _user where email='participant18@example.com'), '03231234567');
insert into user_phone_number values ((select userid from _user where email='participant19@example.com'), '03331234567');
insert into user_phone_number values ((select userid from _user where email='participant19@example.com'), '03431234567');
insert into user_phone_number values ((select userid from _user where email='participant20@example.com'), '03071334567');
insert into user_phone_number values ((select userid from _user where email='participant20@example.com'), '03071334568');
insert into user_phone_number values ((select userid from _user where email='participant21@example.com'), '03081334567');
insert into user_phone_number values ((select userid from _user where email='participant21@example.com'), '03081334568');
insert into user_phone_number values ((select userid from _user where email='participant22@example.com'), '03141234567');
insert into user_phone_number values ((select userid from _user where email='participant22@example.com'), '03141234568');
insert into user_phone_number values ((select userid from _user where email='participant23@example.com'), '03341234567');
insert into user_phone_number values ((select userid from _user where email='participant23@example.com'), '03341234568');
insert into user_phone_number values ((select userid from _user where email='participant24@example.com'), '03441234567');
insert into user_phone_number values ((select userid from _user where email='participant24@example.com'), '03441234568');
insert into user_phone_number values ((select userid from _user where email='participant25@example.com'), '03091444567');
insert into user_phone_number values ((select userid from _user where email='participant25@example.com'), '03091444568');
insert into user_phone_number values ((select userid from _user where email='participant26@example.com'), '03151444567');
insert into user_phone_number values ((select userid from _user where email='participant26@example.com'), '03151444568');


insert into user_phone_number values 
((select userid from _user where email='participant27@example.com'), '03011230001'),
((select userid from _user where email='participant27@example.com'), '03111230001'),

((select userid from _user where email='participant28@example.com'), '03011230002'),
((select userid from _user where email='participant28@example.com'), '03111230002'),

((select userid from _user where email='participant29@example.com'), '03011230003'),
((select userid from _user where email='participant29@example.com'), '03111230003'),

((select userid from _user where email='participant30@example.com'), '03011230004'),
((select userid from _user where email='participant30@example.com'), '03111230004'),

((select userid from _user where email='participant31@example.com'), '03011230005'),
((select userid from _user where email='participant31@example.com'), '03111230005'),

((select userid from _user where email='participant32@example.com'), '03011230006'),
((select userid from _user where email='participant32@example.com'), '03111230006'),

((select userid from _user where email='participant33@example.com'), '03011230007'),
((select userid from _user where email='participant33@example.com'), '03111230007'),

((select userid from _user where email='participant34@example.com'), '03011230008'),
((select userid from _user where email='participant34@example.com'), '03111230008'),

((select userid from _user where email='participant35@example.com'), '03011230009'),
((select userid from _user where email='participant35@example.com'), '03111230009'),

((select userid from _user where email='participant36@example.com'), '03011230010'),
((select userid from _user where email='participant36@example.com'), '03111230010'),

((select userid from _user where email='participant37@example.com'), '03011230011'),
((select userid from _user where email='participant37@example.com'), '03111230011'),

((select userid from _user where email='participant38@example.com'), '03011230012'),
((select userid from _user where email='participant38@example.com'), '03111230012'),

((select userid from _user where email='participant39@example.com'), '03011230013'),
((select userid from _user where email='participant39@example.com'), '03111230013'),

((select userid from _user where email='participant40@example.com'), '03011230014'),
((select userid from _user where email='participant40@example.com'), '03111230014'),

((select userid from _user where email='participant41@example.com'), '03011230015'),
((select userid from _user where email='participant41@example.com'), '03111230015'),

((select userid from _user where email='participant42@example.com'), '03011230016'),
((select userid from _user where email='participant42@example.com'), '03111230016'),

((select userid from _user where email='participant43@example.com'), '03011230017'),
((select userid from _user where email='participant43@example.com'), '03111230017'),

((select userid from _user where email='participant44@example.com'), '03011230018'),
((select userid from _user where email='participant44@example.com'), '03111230018'),

((select userid from _user where email='participant45@example.com'), '03011230019'),
((select userid from _user where email='participant45@example.com'), '03111230019'),

((select userid from _user where email='participant46@example.com'), '03011230020'),
((select userid from _user where email='participant46@example.com'), '03111230020');

insert into judge_expertise values ((select userid from _user where email='judge1@example.com'), 'Nural Networks');
insert into judge_expertise values ((select userid from _user where email='judge1@example.com'), 'Deep learning');
insert into judge_expertise values ((select userid from _user where email='judge1@example.com'), 'Art & Crafts');
insert into judge_expertise values ((select userid from _user where email='judge3@example.com'), 'public speaking');
insert into judge_expertise values ((select userid from _user where email='judge3@example.com'), 'Nural Networks');
insert into judge_expertise values ((select userid from _user where email='judge3@example.com'), 'Computer Vision');
insert into judge_expertise values ((select userid from _user where email='judge4@example.com'), 'Computer Vision');
insert into judge_expertise values ((select userid from _user where email='judge4@example.com'), 'Deep Nural Network');

insert into event (eventname, description, rules, category, registrationfee, maxparticipants, organizerid)
values ('Pakistani Tech Fest', 'explore local tech startups', 'must be Pakistan-based', 'tech events', 500.00, 100, (select userid from _user where email='organizer1@example.com'));

insert into event (eventname, description, rules, category, registrationfee, maxparticipants, organizerid)
values ('Qawwali Night', 'traditional sufi music performance', 'respect cultural norms', 'general events', 300.00, 200, (select userid from _user where email='organizer5@example.com'));

insert into event (eventname, description, rules, category, registrationfee, maxparticipants, organizerid)
values ('PakBiz Challenge', 'simulate local business environment', 'focus on Pakistani market', 'business competitions', 400.00, 60, (select userid from _user where email='organizer3@example.com'));

insert into event (eventname, description, rules, category, registrationfee, maxparticipants, organizerid)
values ('Urdu Mushaira', 'poetry competition in Urdu', 'original content only', 'general events', 100.00, 50, (select userid from _user where email='organizer5@example.com'));

insert into event (eventname, description, rules, category, registrationfee, maxparticipants, organizerid)
values ('National Debate Cup', 'debates on national issues', 'no hate speech', 'general events', 250.00, 40, (select userid from _user where email='organizer4@example.com'));

insert into event (eventname, description, rules, category, registrationfee, maxparticipants, organizerid)
values ('Truck Art Workshop', 'learn traditional truck painting', 'materials provided', 'general events', 200.00, 30, (select userid from _user where email='organizer5@example.com'));

insert into event (eventname, description, rules, category, registrationfee, maxparticipants, organizerid)
values ('Pakistani Cuisine Cook-off', 'cook traditional dishes', 'ingredients must be local', 'general events', 150.00, 20, (select userid from _user where email='organizer5@example.com'));

insert into event (eventname, description, rules, category, registrationfee, maxparticipants, organizerid)
values ('Startup Lahore', 'pitch your startup idea', 'Pakistani founders only', 'business competitions', 600.00, 50, (select userid from _user where email='organizer1@example.com'));

insert into event (eventname, description, rules, category, registrationfee, maxparticipants, organizerid)
values ('Pakistan Gaming League', 'competitive local gaming event', 'team registration allowed', 'gaming tournaments', 300.00, 64, (select userid from _user where email='organizer4@example.com'));

insert into event (eventname, description, rules, category, registrationfee, maxparticipants, organizerid)
values ('Independence Day Hackathon', 'code solutions for Pakistan', 'relevant to national challenges', 'tech events', 0.00, 100, (select userid from _user where email='organizer2@example.com'));

insert into team (teamname) values ('team falcon');
insert into team (teamname) values ('team gamma');
insert into team (teamname) values ('team zindabad');
insert into team (teamname) values ('team sher-e-pakistan');
insert into team (teamname) values ('team iqbal');
insert into team (teamname) values ('team quaid');
insert into team (teamname) values ('team tech warriors');
insert into team (teamname) values ('team lahore lions');
insert into team (teamname) values ('team karachi kings');
insert into team (teamname) values ('team islamabad invincibles');
insert into team (teamname) values ('team delta force');
insert into team (teamname) values ('team horizon');
insert into team (teamname) values ('team punjab panthers');
insert into team (teamname) values ('team sindh strikers');
insert into team (teamname) values ('team balochi blaze');
insert into team (teamname) values ('team kpk knights');
insert into team (teamname) values ('team gilgit guardians');
insert into team (teamname) values ('team urdu united');
insert into team (teamname) values ('team paktech');
insert into team (teamname) values ('team data defenders');

insert into participant (participantid, teamid, university) values
((select userid from _user where email='participant7@example.com'), (select teamid from team where teamname='team falcon'), 'pu lahore'),
((select userid from _user where email='participant8@example.com'), (select teamid from team where teamname='team gamma'), 'pu lahore'),
((select userid from _user where email='participant9@example.com'), (select teamid from team where teamname='team zindabad'), 'fast lahore'),
((select userid from _user where email='participant10@example.com'), (select teamid from team where teamname='team sher-e-pakistan'), 'comsats islamabad'),
((select userid from _user where email='participant11@example.com'), (select teamid from team where teamname='team iqbal'), 'quaid e azam university'),
((select userid from _user where email='participant12@example.com'), (select teamid from team where teamname='team quaid'), 'gcu lahore'),
((select userid from _user where email='participant13@example.com'), (select teamid from team where teamname='team tech warriors'), 'bzu multan'),
((select userid from _user where email='participant14@example.com'), (select teamid from team where teamname='team lahore lions'), 'iub bahawalpur'),
((select userid from _user where email='participant15@example.com'), (select teamid from team where teamname='team karachi kings'), 'uop peshawar'),
((select userid from _user where email='participant16@example.com'), (select teamid from team where teamname='team islamabad invincibles'), 'uog gujrat'),
((select userid from _user where email='participant17@example.com'), (select teamid from team where teamname='team delta force'), 'uet taxila'),
((select userid from _user where email='participant18@example.com'), (select teamid from team where teamname='team horizon'), 'iub rahim yar khan'),
((select userid from _user where email='participant19@example.com'), (select teamid from team where teamname='team punjab panthers'), 'giki'),
((select userid from _user where email='participant20@example.com'), (select teamid from team where teamname='team sindh strikers'), 'uos sahiwal'),
((select userid from _user where email='participant21@example.com'), (select teamid from team where teamname='team balochi blaze'), 'uo okara'),
((select userid from _user where email='participant22@example.com'), (select teamid from team where teamname='team kpk knights'), 'uo hyderabad'),
((select userid from _user where email='participant23@example.com'), (select teamid from team where teamname='team gilgit guardians'), 'baltistan university'),
((select userid from _user where email='participant24@example.com'), (select teamid from team where teamname='team urdu united'), 'swat university'),
((select userid from _user where email='participant25@example.com'), (select teamid from team where teamname='team paktech'), 'comsats abbottabad'),
((select userid from _user where email='participant26@example.com'), (select teamid from team where teamname='team data defenders'), 'uo kasur');


insert into participant (participantid, teamid, university) values
((select userid from _user where email='participant27@example.com'), (select teamid from team where teamname='team falcon'), 'punjab university'),
((select userid from _user where email='participant28@example.com'), (select teamid from team where teamname='team gamma'), 'karachi university'),
((select userid from _user where email='participant29@example.com'), (select teamid from team where teamname='team zindabad'), 'bzu multan'),
((select userid from _user where email='participant30@example.com'), (select teamid from team where teamname='team sher-e-pakistan'), 'gcuf faisalabad'),
((select userid from _user where email='participant31@example.com'), (select teamid from team where teamname='team iqbal'), 'uo sialkot'),
((select userid from _user where email='participant32@example.com'), (select teamid from team where teamname='team quaid'), 'fui rawalpindi'),
((select userid from _user where email='participant33@example.com'), (select teamid from team where teamname='team tech warriors'), 'uo gujranwala'),
((select userid from _user where email='participant34@example.com'), (select teamid from team where teamname='team lahore lions'), 'buitems quetta'),
((select userid from _user where email='participant35@example.com'), (select teamid from team where teamname='team karachi kings'), 'giki'),
((select userid from _user where email='participant36@example.com'), (select teamid from team where teamname='team islamabad invincibles'), 'uo sargodha'),
((select userid from _user where email='participant37@example.com'), (select teamid from team where teamname='team delta force'), 'uo sahiwal'),
((select userid from _user where email='participant38@example.com'), (select teamid from team where teamname='team horizon'), 'comsats abbottabad'),
((select userid from _user where email='participant39@example.com'), (select teamid from team where teamname='team punjab panthers'), 'abdul wali khan university'),
((select userid from _user where email='participant40@example.com'), (select teamid from team where teamname='team sindh strikers'), 'uo kasur'),
((select userid from _user where email='participant41@example.com'), (select teamid from team where teamname='team balochi blaze'), 'ajk university mirpur'),
((select userid from _user where email='participant42@example.com'), (select teamid from team where teamname='team kpk knights'), 'uo jhelum'),
((select userid from _user where email='participant43@example.com'), (select teamid from team where teamname='team gilgit guardians'), 'iub bahawalpur'),
((select userid from _user where email='participant44@example.com'), (select teamid from team where teamname='team urdu united'), 'uo larkana'),
((select userid from _user where email='participant45@example.com'), (select teamid from team where teamname='team paktech'), 'comsats islamabad'),
((select userid from _user where email='participant46@example.com'), (select teamid from team where teamname='team data defenders'), 'sindh university');


insert into accommodation (roomnumber, CheckInDate, checkoutdate, ParticipantID) 
values 
('r7', '2025-05-01 20:00:00', '2025-06-04 12:00:00', (select userid from _user where email='participant7@example.com'));

insert into accommodation (roomnumber, CheckInDate, checkoutdate, ParticipantID) 
values 
('r8', '2025-05-01 21:00:00', '2025-06-04 12:00:00', (select userid from _user where email='participant8@example.com'));

insert into accommodation (roomnumber, CheckInDate, checkoutdate, ParticipantID) 
values 
('r9', '2025-05-01 22:00:00', '2025-06-04 12:00:00', (select userid from _user where email='participant9@example.com'));

insert into accommodation (roomnumber, CheckInDate, checkoutdate, ParticipantID) 
values 
('r10', '2025-05-01 23:00:00', '2025-06-04 12:00:00', (select userid from _user where email='participant10@example.com'));



insert into accommodation (roomnumber, CheckInDate, checkoutdate, ParticipantID) 
values 
('r12', '2025-05-02 01:00:00', '2025-06-04 12:00:00', (select userid from _user where email='participant12@example.com'));

insert into accommodation (roomnumber, CheckInDate, checkoutdate, ParticipantID) 
values 
('r13', '2025-05-02 02:00:00', '2025-06-04 12:00:00', (select userid from _user where email='participant13@example.com'));

insert into accommodation (roomnumber, CheckInDate, checkoutdate, ParticipantID) 
values 
('r14', '2025-05-02 03:00:00', '2025-06-04 12:00:00', (select userid from _user where email='participant14@example.com'));

insert into accommodation (roomnumber, CheckInDate, checkoutdate, ParticipantID) 
values 
('r15', '2025-05-02 04:00:00', '2025-06-04 12:00:00', (select userid from _user where email='participant15@example.com'));

insert into accommodation (roomnumber, CheckInDate, checkoutdate, ParticipantID) 
values 
('r16', '2025-05-02 05:00:00', '2025-06-04 12:00:00', (select userid from _user where email='participant16@example.com'));

insert into eventvenue (eventid, venueid, eventdateTime) values
(6, 6, '2025-06-29 10:00:00'),
(7, 7, '2025-06-29 11:00:00'),
(8, 8, '2025-06-29 12:00:00'),
(9, 9, '2025-06-29 13:00:00'),
(10, 10, '2025-06-29 14:00:00'),
(11, 2, '2025-06-27 10:00:00'),
(12, 3, '2025-06-27 11:00:00'),
(13, 4, '2025-06-27 12:00:00'),
(14, 5, '2025-06-27 13:00:00'),
(15, 6, '2025-06-27 14:00:00');

insert into eventparticipation (participantid, eventid, registrationdatetime) values
((select userid from _user where email='participant7@example.com'), (select EventId from event where eventname='hackathon'), '2025-06-20 09:00:00');

insert into eventparticipation (participantid, eventid, registrationdatetime) values
((select userid from _user where email='participant7@example.com'), (select EventId from event where eventname='Urdu Mushaira'), '2025-06-01 09:30:00');

insert into eventparticipation (participantid, eventid, registrationdatetime) values
((select userid from _user where email='participant8@example.com'), (select EventId from event where eventname='Urdu Mushaira'), '2025-06-01 09:35:00');

insert into eventparticipation (participantid, eventid, registrationdatetime) values
((select userid from _user where email='participant9@example.com'), (select EventId from event where eventname='National Debate Cup'), '2025-06-01 09:40:00');

insert into eventparticipation (participantid, eventid, registrationdatetime) values
((select userid from _user where email='participant10@example.com'), (select EventId from event where eventname='National Debate Cup'), '2025-06-01 09:45:00');

insert into eventparticipation (participantid, eventid, registrationdatetime) values
((select userid from _user where email='participant11@example.com'), (select EventId from event where eventname='Truck Art Workshop'), '2025-06-01 09:50:00');

insert into eventparticipation (participantid, eventid, registrationdatetime) values
((select userid from _user where email='participant12@example.com'), (select EventId from event where eventname='Truck Art Workshop'), '2025-06-01 09:55:00');

insert into eventparticipation (participantid, eventid, registrationdatetime) values
((select userid from _user where email='participant13@example.com'), (select EventId from event where eventname='Pakistani Cuisine Cook-off'), '2025-06-01 10:00:00');

insert into eventparticipation (participantid, eventid, registrationdatetime) values
((select userid from _user where email='participant14@example.com'), (select EventId from event where eventname='Pakistani Cuisine Cook-off'), '2025-06-01 10:05:00');

insert into eventparticipation (participantid, eventid, registrationdatetime) values
((select userid from _user where email='participant15@example.com'), (select EventId from event where eventname='Startup Lahore'), '2025-06-01 10:10:00');

insert into eventparticipation (participantid, eventid, registrationdatetime) values
((select userid from _user where email='participant16@example.com'), (select EventId from event where eventname='Startup Lahore'), '2025-06-01 10:15:00');

insert into eventparticipation (participantid, eventid, registrationdatetime) values
((select userid from _user where email='participant17@example.com'), (select EventId from event where eventname='Pakistan Gaming League'), '2025-06-01 10:20:00');

insert into eventparticipation (participantid, eventid, registrationdatetime) values
((select userid from _user where email='participant18@example.com'), (select EventId from event where eventname='Pakistan Gaming League'), '2025-06-01 10:25:00');

insert into eventparticipation (participantid, eventid, registrationdatetime) values
((select userid from _user where email='participant19@example.com'), (select EventId from event where eventname='Independence Day Hackathon'), '2025-06-01 10:30:00');

insert into eventparticipation (participantid, eventid, registrationdatetime) values
((select userid from _user where email='participant20@example.com'), (select EventId from event where eventname='Independence Day Hackathon'), '2025-06-01 10:35:00');

insert into JudgeEvent (JudgeID, EventID) values
((select userid from _user where email = 'judge5@example.com'), (select EventId from event where eventname='Pakistani Tech Fest')),
((select userid from _user where email = 'judge6@example.com'), (select EventId from event where eventname='Qawwali Night')),
((select userid from _user where email = 'judge7@example.com'), (select EventId from event where eventname='PakBiz Challenge')),
((select userid from _user where email = 'judge8@example.com'), (select EventId from event where eventname='Urdu Mushaira')),
((select userid from _user where email = 'judge9@example.com'), (select EventId from event where eventname='National Debate Cup')),
((select userid from _user where email = 'judge10@example.com'), (select EventId from event where eventname='Truck Art Workshop')),
((select userid from _user where email = 'judge11@example.com'), (select EventId from event where eventname='Pakistani Cuisine Cook-off')),
((select userid from _user where email = 'judge12@example.com'), (select EventId from event where eventname='Startup Lahore')),
((select userid from _user where email = 'judge13@example.com'), (select EventId from event where eventname='Pakistan Gaming League'));