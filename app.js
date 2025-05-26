const express = require('express');
const path = require('path');
var db = require('./config/database');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
// login


app.post('/getuserrr', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    db.query('SELECT UserID, FirstName, LastName FROM _USER WHERE email=? AND password=?', 
        [email, password], 
        (err, users) => {
            if (err) {
                console.error('Error querying users:', err);
                return res.status(500).json({ error: 'Internal server error during login' }); 
            }
            
            return res.json(users); 
        }
    );
});

app.post('/getrole', (req, res) => {

    try {
        const id = req.body.id;
        
        if (!id) {
             return res.status(400).json({ error: 'User ID is required' });
        }

        db.query("SELECT AdminID FROM admin WHERE AdminID = ?", [id], (err, admins) => {
            if (err) {
                return res.status(500).json({ error: 'Database error checking admin role' });
            }
            
            if (admins && admins.length > 0) {
                return res.json({ role: "admin" });
            }
            
            db.query("SELECT OrganizerID FROM EventOrganizer WHERE OrganizerID = ?", [id], (err, organizers) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error checking organizer role' });
                }
                
                if (organizers && organizers.length > 0) {
                    return res.json({ role: "organizer" });
                }
                
                db.query("SELECT JudgeID FROM Judge WHERE JudgeID = ?", [id], (err, judges) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error checking judge role' });
                    }
                    
                    if (judges && judges.length > 0) {
                         console.log(`UserID ${id} is a judge`);
                        return res.json({ role: "judge" });
                    }
                    
                    db.query("SELECT ParticipantID FROM Participant WHERE ParticipantID = ?", [id], (err, participants) => {
                        if (err) {
                            return res.status(500).json({ error: 'Database error checking participant role' });
                        }
                        
                        if (participants && participants.length > 0) {
                            return res.json({ role: "participant" });
                        }
                        
                        db.query("SELECT SponsorID FROM Sponsor WHERE SponsorID = ?", [id], (err, sponsors) => {
                            if (err) {
                                console.error('Error checking sponsor role:', err);
                                return res.status(500).json({ error: 'Database error checking sponsor role' });
                            }
                            
                            if (sponsors && sponsors.length > 0) {
                                 console.log(`UserID ${id} is a sponsor`);
                                return res.json({ role: "sponsor" });
                            }
                            
                            return res.json({ role: 'unknown' });
                        });
                    });
                });
            });
        });
        
    } catch (error) {
        console.error(' error in getrole:', error); 
        return res.status(500).json({ error: 'Failed to determine user role due to unexpected error' });
    }
});
app.post("/insertinlogin", (req, res) => {
    const { UserID, name } = req.body; 

    const sql = "INSERT INTO currentLogin (id, name) VALUES (?, ?)"; 
    
    db.query(sql, [UserID, name], (err, result) => { 
        if (err) {
            console.error("Database error inserting into currentLogin:", err);
            return res.status(500).json({ message: "Database error", error: err.message }); 
        }
        res.status(200).json({ message: "Login recorded successfully" }); 
    });
});
// admin-dashboard

app.get('/getuseradmin', (req, res) => { 

  db.query("SELECT UserID, FirstName, MiddleName, LastName, Email, city FROM _USER", (errUsers, users) => {
      if (errUsers) {
          console.error('Error fetching users:', errUsers);
          return res.status(500).json({ error: 'Database error fetching users' });
      }
      

      db.query("SELECT AdminID FROM Admin", (errAdmins, adminRows) => {
          if (errAdmins) {
              console.error('Error fetching admins:', errAdmins);
              return res.status(500).json({ error: 'Database error fetching admins' });
          }

          db.query("SELECT OrganizerID FROM EventOrganizer", (errOrganizers, organizerRows) => {
              if (errOrganizers) {
                  console.error('Error fetching organizers:', errOrganizers);
                  return res.status(500).json({ error: 'Database error fetching organizers' });
              }

              db.query("SELECT JudgeID FROM Judge", (errJudges, judgeRows) => {
                  if (errJudges) {
                      console.error('Error fetching judges:', errJudges);
                      return res.status(500).json({ error: 'Database error fetching judges' });
                  }

                  db.query("SELECT ParticipantID FROM Participant", (errParticipants, participantRows) => {
                      if (errParticipants) {
                          console.error('Error fetching participants:', errParticipants);
                          return res.status(500).json({ error: 'Database error fetching participants' });
                      }

                      db.query("SELECT SponsorID FROM Sponsor", (errSponsors, sponsorRows) => {
                          if (errSponsors) {
                              console.error('Error fetching sponsors:', errSponsors);
                              return res.status(500).json({ error: 'Database error fetching sponsors' });
                          }

                          const combinedUsers = [];
                          for (let i = 0; i < users.length; i++) {
                              const user = users[i];
                              let role = 'unknown';

                              if (found(adminRows, 'AdminID', user.UserID)) {
                                  role = 'admin';
                              } else if (found(organizerRows, 'OrganizerID', user.UserID)) {
                                  role = 'organizer';
                              } else if (found(judgeRows, 'JudgeID', user.UserID)) {
                                  role = 'judge';
                              } else if (found(participantRows, 'ParticipantID', user.UserID)) {
                                  role = 'participant';
                              } else if (found(sponsorRows, 'SponsorID', user.UserID)) {
                                  role = 'sponsor';
                              }

                              const combinedUser = {
                                  UserID: user.UserID,
                                  FirstName: user.FirstName ?? '',
                                  MiddleName: user.MiddleName ?? '',
                                  LastName: user.LastName ?? '',
                                  Email: user.Email ?? '',
                                  city: user.city ?? '',
                                  role: role,
                              };
                              combinedUsers.push(combinedUser);
                          }
                          res.json(combinedUsers);

                      }); 
                  });
              }); 
          }); 
      });
  }); 
});
app.get('/getorganizeradmin', (req, res) => { 

    db.query("SELECT UserID, FirstName, MiddleName, LastName, Email, city FROM _USER", (errUsers, users) => {
        if (errUsers) {
            console.error('Error fetching users:', errUsers);
            return res.status(500).json({ error: 'Database error fetching users' });
        }

            db.query("SELECT OrganizerID FROM EventOrganizer", (errOrganizers, organizerRows) => {
                if (errOrganizers) {
                    console.error('Error fetching organizers:', errOrganizers);
                    return res.status(500).json({ error: 'Database error fetching organizers' });
                }
                     const combinedUsers = [];
                            for (let i = 0; i < users.length; i++) {
                                const user = users[i];
                                let role = 'unknown';

                                if (found(organizerRows, 'OrganizerID', user.UserID)) {
                                    role = 'organizer';
                                } else {
                                  continue;
                                }

                                const combinedUser = {
                                    UserID: user.UserID,
                                    FirstName: user.FirstName , 
                                    MiddleName: user.MiddleName,
                                    LastName: user.LastName,
                                    Email: user.Email ,
                                    city: user.city,
                                    role: role,
                                };
                                combinedUsers.push(combinedUser);
                            }
                            res.json(combinedUsers);

                        }); 
                    }); 
                }); 
app.get('/getparticipantadmin', (req, res) => { 

                  db.query("SELECT UserID, FirstName, MiddleName, LastName, Email, city FROM _USER", (errUsers, users) => {
                      if (errUsers) {
                          console.error('Error fetching users:', errUsers);
                          return res.status(500).json({ error: 'Database error fetching users' });
                      }
              
                          db.query("SELECT ParticipantID FROM Participant", (errOrganizers, organizerRows) => {
                              if (errOrganizers) {
                                  console.error('Error fetching organizers:', errOrganizers);
                                  return res.status(500).json({ error: 'Database error fetching organizers' });
                              }
                                   const combinedUsers = [];
                                          for (let i = 0; i < users.length; i++) {
                                              const user = users[i];
                                              let role = 'unknown';
              
                                              if (found(organizerRows, 'ParticipantID', user.UserID)) {
                                                  role = 'participant';
                                              } else {
                                                continue;
                                              }
              
                                              const combinedUser = {
                                                  UserID: user.UserID,
                                                  FirstName: user.FirstName , 
                                                  MiddleName: user.MiddleName,
                                                  LastName: user.LastName,
                                                  Email: user.Email ,
                                                  city: user.city,
                                                  role: role,
                                              };
                                              combinedUsers.push(combinedUser);
                                          }
                                          res.json(combinedUsers);
              
                                      }); 
                                  }); 
                              }); 
app.get('/getjudgeadmin', (req, res) => { 

                                db.query("SELECT UserID, FirstName, MiddleName, LastName, Email, city FROM _USER", (errUsers, users) => {
                                    if (errUsers) {
                                        console.error('Error fetching users:', errUsers);
                                        return res.status(500).json({ error: 'Database error fetching users' });
                                    }
                            
                                        db.query("SELECT JudgeID FROM Judge", (errOrganizers, organizerRows) => { 
                                            if (errOrganizers) {
                                                console.error('Error fetching organizers:', errOrganizers);
                                                return res.status(500).json({ error: 'Database error fetching organizers' });
                                            }
                                                 const combinedUsers = [];
                                                        for (let i = 0; i < users.length; i++) {
                                                            const user = users[i];
                                                            let role = 'unknown';
                            
                                                            if (found(organizerRows, 'JudgeID', user.UserID)) { 
                                                                role = 'judge';
                                                            } else {
                                                              continue;
                                                            }
                            
                                                            const combinedUser = {
                                                                UserID: user.UserID,
                                                                FirstName: user.FirstName , 
                                                                MiddleName: user.MiddleName,
                                                                LastName: user.LastName,
                                                                Email: user.Email ,
                                                                city: user.city,
                                                                role: role,
                                                            };
                                                            combinedUsers.push(combinedUser);
                                                        }
                                                        res.json(combinedUsers);
                            
                                                    }); 
                                                }); 
                                            });                     
 app.get('/getsponsoradmin', (req, res) => { 

 db.query("SELECT UserID, FirstName, MiddleName, LastName, Email, city FROM _USER", (errUsers, users) => {
                                                    if (errUsers) {
                                                        console.error('Error fetching users:', errUsers);
                                                        return res.status(500).json({ error: 'Database error fetching users' });
                                                    }
                                            
                                                        db.query("SELECT SponsorID FROM Sponsor", (errOrganizers, organizerRows) => {
                                                            if (errOrganizers) {
                                                                console.error('Error fetching organizers:', errOrganizers);
                                                                return res.status(500).json({ error: 'Database error fetching organizers' });
                                                            }
                                                                 const combinedUsers = [];
                                                                        for (let i = 0; i < users.length; i++) {
                                                                            const user = users[i];
                                                                            let role = 'unknown';
                                            
                                                                            if (found(organizerRows, 'SponsorID', user.UserID)) {
                                                                                role = 'sponsor'; // Changed from 'Sponsor' to 'sponsor' for consistency
                                                                            } else {
                                                                              continue;
                                                                            }
                                            
                                                                            const combinedUser = {
                                                                                UserID: user.UserID,
                                                                                FirstName: user.FirstName , 
                                                                                MiddleName: user.MiddleName,
                                                                                LastName: user.LastName,
                                                                                Email: user.Email ,
                                                                                city: user.city,
                                                                                role: role,
                                                                            };
                                                                            combinedUsers.push(combinedUser);
                                                                        }
                                                                        // Send the final response only after all processing is done
                                                                        res.json(combinedUsers);
                                            
                                                                    }); 
                                                                }); 
                                                            }); 
app.get('/getevents', (req, res) => { 
    const sql = `SELECT e.EventID, e.EventName, e.Category, ev.EventDateTime, v.VenueName, u.FirstName, e.RegistrationFee, e.MaxParticipants FROM Event e NATURAL JOIN EventVenue ev NATURAL JOIN Venue v JOIN _USER u ON e.OrganizerID = u.UserID`;

    db.query(sql, (err, events) => {
        if (err) {
            console.error('Error fetching events:', err);
            res.status(500).json({ error: 'Internal server error fetching events' });
        } else {
            res.json(events);
        }
    });
});
app.get('/getvenues', (req, res) => { 
  const sql = "select * from Venue";
  db.query(sql,(err,venues)=>{
    if(err){
      console.error('Error fetching venues:', err);
      res.status(500).json({ error: 'Internal server error fetching venues' });
    } else {
      res.json(venues);
    }
  });
});


app.listen(4000, function() {
    console.log('Running on 4000');
});

app.post('/geteventbycategoryindex', (req, res) => {
        const sql = `SELECT e.EventID, e.EventName, e.Category, ev.EventDateTime, v.VenueName, u.FirstName, e.RegistrationFee, e.MaxParticipants FROM Event e NATURAL JOIN EventVenue ev NATURAL JOIN Venue v JOIN _USER u ON e.OrganizerID = u.UserID where e.Category = ?`;
    const category = req.body.category; 
    db.query(sql, [category], (err, events) => {    
            if (err) {
                console.error('Error fetching events:', err);
                res.status(500).json({ error: 'Internal server error fetching events' });
            } else {
                res.json(events);
            }
        });
    });
    
// can be trigger
app.post('/deleteeventadmin', (req, res) => {
    const eventId = req.body.eventId;
    
    db.query('DELETE FROM Evaluation WHERE EventID = ?', [eventId], (err, result) => {
        if (err) {
            console.error('Error deleting from Evaluation:', err);
            return res.status(500).json({ error: 'Failed to delete event evaluations' });
        }
                db.query('DELETE FROM EventParticipation WHERE EventID = ?', [eventId], (err, result) => {
            if (err) {
                console.error('Error deleting from EventParticipation:', err);
                return res.status(500).json({ error: 'Failed to delete event participations' });
            }
                        db.query('DELETE FROM JudgeEvent WHERE EventID = ?', [eventId], (err, result) => {
                if (err) {
                    console.error('Error deleting from JudgeEvent:', err);
                    return res.status(500).json({ error: 'Failed to delete judge event assignments' });
                }
                
                db.query('DELETE FROM EventVenue WHERE EventID = ?', [eventId], (err, result) => {
                    if (err) {
                        console.error('Error deleting from EventVenue:', err);
                        return res.status(500).json({ error: 'Failed to delete event venue mapping' });
                    }
                    
                    db.query('DELETE FROM Event WHERE EventID = ?', [eventId], (err, result) => {
                        if (err) {
                            console.error('Error deleting event:', err);
                            return res.status(500).json({ error: 'Failed to delete event' });
                        }
                        
                        return res.status(200).json({ message: 'Event deleted successfully' });
                    });
                });
            });
        });
    });
});

app.post('/geteventbyorganizerid', (req, res) => {
    console.log("geteventbyorganizeridfunc ");

    const organizerId = req.body.organizerId;
    
    if (!organizerId) {
        console.error('Missing organizer ID in request body');
        return res.status(400).json({ error: 'Organizer ID is required' });
    }
    
    console.log(`Fetching event for organizer ID: ${organizerId}`);
    
    const sql = `SELECT e.EventID, e.EventName, e.Category, ev.EventDateTime, v.VenueName, e.RegistrationFee, e.MaxParticipants 
                 FROM Event e 
                 NATURAL JOIN EventVenue ev 
                 NATURAL JOIN Venue v 
                 where e.OrganizerID = ?
                 `;
    
    db.query(sql, [organizerId], (err, events) => {
        if (err) {
            console.error('Error fetching event for organizer:', err);
            return res.status(500).json({ error: 'Database error fetching event for organizer' });
        }
        
        if (events.length === 0) {
            return res.json([]);
        }
        
        return res.json(events);
    });
});

app.get('/events/:id', (req, res) => {
    const eventId = req.params.id;
    console.log(`Fetching event with ID: ${eventId}`);
    
    const sql = `
        SELECT e.EventID, e.EventName, e.Category, e.Description, e.Rules, e.RegistrationFee, e.MaxParticipants, 
               e.OrganizerID, ev.EventDateTime as DateTime, v.VenueName, v.Location, v.Capacity, u.FirstName, u.LastName, u.Email 
        FROM Event e 
        LEFT JOIN EventVenue ev ON e.EventID = ev.EventID
        LEFT JOIN Venue v ON ev.VenueID = v.VenueID
        LEFT JOIN _USER u ON e.OrganizerID = u.UserID
        WHERE e.EventID = ?`;
    
    db.query(sql, [eventId], (err, results) => {
        if (err) {
            console.error('Error fetching event details:', err);
            return res.status(500).json({ error: 'Database error fetching event details' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        const event = results[0];
        
        const countSql = `SELECT COUNT(*) as RegisteredParticipants FROM EventParticipation WHERE EventID = ?`;
        db.query(countSql, [eventId], (countErr, countResults) => {
            if (countErr) {
                console.error('Error fetching participant count:', countErr);
                event.RegisteredParticipants = 0;
                return res.json(event);
            }
            
            event.RegisteredParticipants = countResults[0].RegisteredParticipants || 0;
            return res.json(event);
        });
    });
});

app.post('/geteventbyid', (req, res) => {
    const eventId = req.body.eventId;
    
    
    
    const sql = `
        SELECT e.EventID, e.EventName, e.Category, e.Description, e.Rules, e.RegistrationFee, e.MaxParticipants, 
               e.OrganizerID, ev.EventDateTime as DateTime, v.VenueName, v.Location, v.Capacity, u.FirstName, u.LastName, u.Email 
        FROM Event e 
        LEFT JOIN EventVenue ev ON e.EventID = ev.EventID
        LEFT JOIN Venue v ON ev.VenueID = v.VenueID
        LEFT JOIN _USER u ON e.OrganizerID = u.UserID
        WHERE e.EventID = ?`;
    
    db.query(sql, [eventId], (err, results) => {
        if (err) {
            console.error('Error fetching event details:', err);
            return res.status(500).json({ error: 'Database error fetching event details' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        const event = results[0];
        
        const countSql = `SELECT COUNT(*) as RegisteredParticipants FROM EventParticipation WHERE EventID = ?`;
        db.query(countSql, [eventId], (countErr, countResults) => {
            if (countErr) {
                console.error('Error fetching participant count:', countErr);
                event.RegisteredParticipants = 0;
                return res.json(event);
            }
            
            event.RegisteredParticipants = countResults[0].RegisteredParticipants || 0;
            return res.json(event);
        });
    });
});

//  HTML files
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/signup', function(req, res) {
  res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.get('/admin', function(req, res) {
  res.sendFile(path.join(__dirname, 'views', 'admin-dashboard.html'));
});

app.get('/organizer', function(req, res) {
  res.sendFile(path.join(__dirname, 'views', 'organizer-dashboard.html'));
});
app.get('/event/:id', function(req, res) {
    res.sendFile(path.join(__dirname, 'views', 'event-details.html'));
  });
  app.get('/eventedit/:id', function(req, res) {
    res.sendFile(path.join(__dirname, 'views', 'event-edit.html'));
  });
app.get('/participant', function(req, res) {
  res.sendFile(path.join(__dirname, 'views', 'participant-dashboard.html'));
});


app.get('/judge', function(req, res) {
  res.sendFile(path.join(__dirname, 'views/judge-dashboard.html'));
});
app.get('/eventCreate', function(req, res) {
    res.sendFile(path.join(__dirname, 'views', 'event-create.html'));
  });

  app.get('/judge/events', function(req, res) {
    res.sendFile(path.join(__dirname, 'views', 'judge-events.html'));
});

app.get('/judge/scoring', function(req, res) {
    res.sendFile(path.join(__dirname, 'views', 'judge-scoring.html'));
});

app.get('/judge/profile', function(req, res) {
    res.sendFile(path.join(__dirname, 'views', 'judge-profile.html'));
});

app.get('/judge/events/:id', function(req, res) {
    res.sendFile(path.join(__dirname, 'views', 'judge-event-details.html'));
});

app.get('/judge/scoring/:id', function(req, res) {
    res.sendFile(path.join(__dirname, 'views', 'judge-score-event.html'));
});
app.get('/sponsor', function(req, res) {
    res.sendFile(path.join(__dirname, 'views', 'sponsor-dashboard.html'));
  });

// commom function 
function found(array,key,value){
    for(let i=0;i<array.length;i++){
        if(array[i][key]==value){
            return true;
        }
    }
    return false;
}

app.get('/organizers', (req, res) => {
    db.query("SELECT UserID, FirstName, LastName, Email FROM _USER u JOIN EventOrganizer e ON u.UserID = e.OrganizerID", (err, organizers) => {
        if (err) {
            console.error('Error fetching organizers:', err);
            return res.status(500).json({ error: 'Database error fetching organizers' });
        }
        
        const formattedOrganizers = [];

        for (let i = 0; i < organizers.length; i++) {
            const organizer = organizers[i];
            formattedOrganizers.push({
                UserID: organizer.UserID,
                Name: `${organizer.FirstName} ${organizer.LastNam}`,
                Email: organizer.Email
            });
        }
        
       return res.json(formattedOrganizers);
    });
});

app.get('/getlastuser', (req, res) => {
    
    const sql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
    
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching last user:', err);
            return res.status(500).json({ error: 'Database error fetching last user' });
        }
        
        if (result.length === 0) {
            console.log('No users found in currentLogin table');
            return res.status(404).json({ error: 'No users found in login table' });
        }
        
        return res.json(result[0]);
       
});});

app.get('/eventregistermeeventdetail', (req, res) => {
    const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
    
    db.query(userSql, (err, users) => {
        if (err) {
            console.error('Error fetching current user:', err);
            return res.status(500).json({ error: 'Database error fetching current user' });
        }
        
        if (users.length === 0) {
            console.log('No logged in user found');
            return res.status(401).json({ error: 'No logged in user found' });
        }
        
        const userId = users[0].id;
        
        const eventSql = `
            SELECT e.EventID, e.EventName, e.Category, e.Description, ev.EventDateTime as DateTime, 
                   v.VenueName, e.RegistrationFee
            FROM Event e
            JOIN EventParticipation ep ON e.EventID = ep.EventID
            LEFT JOIN EventVenue ev ON e.EventID = ev.EventID
            LEFT JOIN Venue v ON ev.VenueID = v.VenueID
            WHERE ep.ParticipantID = ?
        `;
        
        db.query(eventSql, [userId], (eventErr, events) => {
            if (eventErr) {
                console.error('Error fetching registered events:', eventErr);
                return res.status(500).json({ error: 'Database error fetching registered events' });
            }
            
            return res.json(events);
        });
    });
});

app.post('/registerParticipantForEvent/:id', (req, res) => {
    const eventId = req.params.id;
    
    const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
    
    db.query(userSql, (err, users) => {
        if (err) {
            console.error('Error fetching current user:', err);
            return res.status(500).json({ error: 'Database error fetching current user' });
        }
        
        if (users.length === 0) {
            console.log('No logged in user found');
            return res.status(401).json({ error: 'No logged in user found' });
        }
        
        const userId = users[0].id;
        
        const checkSql = `SELECT * FROM EventParticipation WHERE ParticipantID = ? AND EventID = ?`;
        db.query(checkSql, [userId, eventId], (checkErr, existing) => {
            if (checkErr) {
                console.error('Error checking existing registration:', checkErr);
                return res.status(500).json({ error: 'Database error checking registration' });
            }
            
            if (existing.length > 0) {
                return res.status(400).json({ message: 'You are already registered for this event' });
            }
            
            const eventSql = `
                SELECT e.MaxParticipants, COUNT(ep.ParticipantID) as RegisteredCount
                FROM Event e 
                LEFT JOIN EventParticipation ep ON e.EventID = ep.EventID
                WHERE e.EventID = ?
                GROUP BY e.EventID
            `;
            
            db.query(eventSql, [eventId], (eventErr, eventData) => {
                if (eventErr) {
                    console.error('Error checking event capacity:', eventErr);
                    return res.status(500).json({ error: 'Database error checking event capacity' });
                }
                
                if (eventData.length === 0) {
                    return res.status(404).json({ error: 'Event not found' });
                }
                
                const maxParticipants = eventData[0].MaxParticipants;
                const registeredCount = eventData[0].RegisteredCount;
                
                if (registeredCount >= maxParticipants) {
                    return res.status(400).json({ message: 'This event is full' });
                }
                
                const registerSql = `INSERT INTO EventParticipation (EventID, ParticipantID, RegistrationDateTime) VALUES (?, ?, NOW())`;
                db.query(registerSql, [eventId, userId], (registerErr, result) => {
                    if (registerErr) {
                        console.error('Error registering for event:', registerErr);
                        return res.status(500).json({ error: 'Database error during registration' });
                    }
                    
                    return res.status(201).json({ message: 'Registration successful' });
                });
            });
        });
    });
});

app.post('/createevent', (req, res) => {
    const { eventName, category, organizerId, description, rules, dateTime, venueId, maxParticipants, registrationFee } = req.body;
    
    if (!eventName || !category || !dateTime || !venueId || !maxParticipants || registrationFee === undefined || !organizerId) {
        return res.status(400).json({ error: 'Missing required event information' });
    }

    const eventSql = `
        INSERT INTO Event 
        (EventName, Category, Description, Rules, OrganizerID, RegistrationFee, MaxParticipants) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(eventSql, [eventName, category, description, rules, organizerId, registrationFee, maxParticipants], 
        (eventErr, eventResult) => {
            if (eventErr) {
                console.error('Error creating event:', eventErr);
                return res.status(500).json({ error: 'Failed to create event' });
            }
            
            const eventId = eventResult.insertId;
            
            const venueSql = `
                INSERT INTO EventVenue 
                (EventID, VenueID, EventDateTime) 
                VALUES (?, ?, ?)
            `;
            
            db.query(venueSql, [eventId, venueId, dateTime], (venueErr) => {
                if (venueErr) {
                    console.error('Error associating event with venue:', venueErr);
                    return res.status(500).json({ error: 'Failed to associate event with venue' });
                }
                
                res.status(201).json({ 
                    message: 'Event created successfully',
                    eventId: eventId
                });
            });
        }
    );
});




//  a single event by ID 
app.get('/api/events/:eventId', (req, res) => {
    const eventId = req.params.eventId;
    console.log(`Fetching event with ID: ${eventId}`);
    
    const query = `
        SELECT e.*, v.VenueName, v.Location, v.Capacity, ev.VenueID,
               (SELECT COUNT(*) FROM EventParticipation WHERE EventID = e.EventID) AS RegisteredParticipants
        FROM Event e
        LEFT JOIN EventVenue ev ON e.EventID = ev.EventID
        LEFT JOIN Venue v ON ev.VenueID = v.VenueID
        WHERE e.EventID = ?
    `;
    
    db.query(query, [eventId], (err, results) => {
        if (err) {
            console.error('Error fetching event:', err);
            return res.status(500).json({ message: 'Database error fetching event' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        res.json(results[0]);
    });
});

app.get('/getuser', (req, res) => {
    console.log('getuser request received');
    
    const sql = "SELECT cl.id, cl.name, u.FirstName, u.Email FROM currentLogin cl JOIN _USER u ON cl.id = u.UserID ORDER BY cl.id DESC LIMIT 1";
    
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching current user:', err);
            return res.status(500).json({ error: 'Database error fetching user' });
        }
        
        if (result.length === 0) {
            console.log('No users found in currentLogin table');
            return res.status(404).json({ error: 'No user is currently logged in' });
        }
        
        const userId = result[0].id;
        
        db.query("SELECT AdminID FROM admin WHERE AdminID = ?", [userId], (err, admins) => {
            if (err) {
                console.error('Error checking admin role:', err);
                return res.status(500).json({ error: 'Database error checking role' });
            }
            
            if (admins && admins.length > 0) {
                result[0].role = "admin";
                return res.json(result[0]);
            }
            
            db.query("SELECT OrganizerID FROM EventOrganizer WHERE OrganizerID = ?", [userId], (err, organizers) => {
                if (err) {
                    console.error('Error checking organizer role:', err);
                    return res.status(500).json({ error: 'Database error checking role' });
                }
                
                if (organizers && organizers.length > 0) {
                    result[0].role = "organizer";
                    return res.json(result[0]);
                }
                
                db.query("SELECT JudgeID FROM Judge WHERE JudgeID = ?", [userId], (err, judges) => {
                    if (err) {
                        console.error('Error checking judge role:', err);
                        return res.status(500).json({ error: 'Database error checking role' });
                    }
                    
                    if (judges && judges.length > 0) {
                        result[0].role = "judge";
                        return res.json(result[0]);
                    }
                    
                    db.query("SELECT ParticipantID FROM Participant WHERE ParticipantID = ?", [userId], (err, participants) => {
                        if (err) {
                            console.error('Error checking participant role:', err);
                            return res.status(500).json({ error: 'Database error checking role' });
                        }
                        
                        if (participants && participants.length > 0) {
                            result[0].role = "participant";
                            return res.json(result[0]);
                        }
                        
                        db.query("SELECT SponsorID FROM Sponsor WHERE SponsorID = ?", [userId], (err, sponsors) => {
                            if (err) {
                                console.error('Error checking sponsor role:', err);
                                return res.status(500).json({ error: 'Database error checking role' });
                            }
                            
                            if (sponsors && sponsors.length > 0) {
                                result[0].role = "sponsor";
                                return res.json(result[0]);
                            }
                            
                            result[0].role = "unknown";
                            return res.json(result[0]);
                        });
                    });
                });
            });
        });
    });
});

app.post('/logout', (req, res) => {
    console.log('Processing logout request');
    
    const sql = "DELETE FROM currentLogin ";
    
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).json({ error: 'Database error during logout' });
        }
        
        return res.status(200).json({ message: 'Logged out successfully' });
    });
});

app.get('/getavailableorganizers', (req, res) => {
    
    db.query("SELECT OrganizerID FROM EventOrganizer", (orgErr, organizers) => {
        if (orgErr) {
            console.error('Error fetching organizers:', orgErr);
            return res.status(500).json({ error: 'Database error fetching organizers' });
        }
        
        if (!organizers || organizers.length === 0) {
            return res.json([]);
        }
        
        const organizerIds = [];
        for (let i = 0; i < organizers.length; i++) {
            organizerIds.push(organizers[i].OrganizerID);
        }
        
        db.query("SELECT DISTINCT OrganizerID FROM Event", (eventErr, assignedOrganizers) => {
            if (eventErr) {
                console.error('Error fetching assigned organizers:', eventErr);
                return res.status(500).json({ error: 'Database error fetching assigned organizers' });
            }
            
            const assignedIds = [];
            for (let i = 0; i < assignedOrganizers.length; i++) {
                assignedIds.push(assignedOrganizers[i].OrganizerID);
            }
            
            const availableIds = [];
            for (let i = 0; i < organizerIds.length; i++) {
                let isAssigned = false;
                for (let j = 0; j < assignedIds.length; j++) {
                    if (organizerIds[i] === assignedIds[j]) {
                        isAssigned = true;
                        break;
                    }
                }
                if (!isAssigned) {
                    availableIds.push(organizerIds[i]);
                }
            }
            
            if (availableIds.length === 0) {
                console.log('No available organizers found');
                return res.json([]);
            }
            
            let placeholders = '';
            for (let i = 0; i < availableIds.length; i++) {
                placeholders += i === 0 ? '?' : ',?';
            }
            const userSql = `SELECT UserID, FirstName, MiddleName, LastName FROM _USER WHERE UserID IN (${placeholders})`;
            
            db.query(userSql, availableIds, (userErr, availableOrganizers) => {
                if (userErr) {
                    console.error('Error fetching organizer details:', userErr);
                    return res.status(500).json({ error: 'Database error fetching organizer details' });
                }
                
                res.json(availableOrganizers);
            });
        });
    });
});

// to get available venues 
app.post('/getavailablevenues', (req, res) => {
    const { eventDate, eventTime } = req.body;
    
    if (!eventDate || !eventTime) {
        const sql = "SELECT * FROM Venue WHERE Status = 'Available'";
        db.query(sql, (err, venues) => {
            if (err) {
                console.error('Error fetching venues:', err);
                return res.status(500).json({ error: 'Database error fetching venues' });
            }
            return res.json(venues);
        });
        return;
    }
    
    // Convert eventTime to MySQL time format if needed
    const dateTime = `${eventDate} ${eventTime}`;
    console.log(`Checking venue availability for: ${dateTime}`);
    
    // SQL to find venues that don't have an event at the specified time
    const sql = `
        SELECT v.* 
        FROM Venue v 
        WHERE v.VenueID NOT IN (
            SELECT ev.VenueID 
            FROM EventVenue ev 
            WHERE DATE(ev.EventDate) = ? AND ABS(TIME_TO_SEC(TIMEDIFF(TIME(ev.EventDate), ?))) < 7200
        ) AND v.Status = 'Available'
    `;
    
    db.query(sql, [eventDate, eventTime], (err, venues) => {
        if (err) {
            console.error('Error fetching available venues:', err);
            return res.status(500).json({ error: 'Database error fetching available venues' });
        }
        
        console.log(`Found ${venues.length} available venues for ${dateTime}`);
        res.json(venues);
    });
});

//  to get participants by event ID
app.post('/getparticipantsbyevent', (req, res) => {
    const eventId = req.body.eventId;
    
    if (!eventId) {
        console.error('Missing event ID in request body');
        return res.status(400).json({ error: 'Event ID is required' });
    }
    
    
    const sql = `
        SELECT u.UserID, u.FirstName, u.MiddleName, u.LastName, u.Email, u.city
        FROM _USER u
        JOIN EventParticipation ep ON u.UserID = ep.ParticipantID
        WHERE ep.EventID = ?
    `;
    
    db.query(sql, [eventId], (err, participants) => {
        if (err) {
            console.error('Error fetching participants for event:', err);
            return res.status(500).json({ error: 'Database error fetching participants' });
        }
        
        return res.json(participants);
    });
});

// Replace the incorrect organizers endpoint at the bottom of the file
app.get('/api/organizers', (req, res) => {
    const query = `
        SELECT u.UserID, u.FirstName, u.LastName, u.Email 
        FROM _USER u 
        JOIN EventOrganizer eo ON u.UserID = eo.OrganizerID
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching organizers:', err);
            return res.status(500).json({ message: 'Database error fetching organizers' });
        }
        
        const formattedResults = results.map(org => ({
            id: org.UserID,
            name: `${org.FirstName} ${org.LastName}`,
            email: org.Email || ''
        }));
        
        res.json(formattedResults);
    });
});
// //.
// app.put('/api/events/:eventId', (req, res) => {
//     const eventId = req.params.eventId;
//     const {
//         eventName,
//         category,
//         organizerId,
//         description,
//         rules,
//         dateTime,
//         venueId,
//         maxParticipants,
//         registrationFee
//     } = req.body;


//     // Begin transaction to ensure data consistency
//     db.beginTransaction((transErr) => {
//         if (transErr) {
//             console.error('Error starting transaction:', transErr);
//             return res.status(500).json({ error: 'Database transaction error' });
//         }

//         // First check if reducing maxParticipants would affect current registrations
//         const countSql = `SELECT COUNT(*) as currentRegistrations FROM EventParticipation WHERE EventID = ?`;
//         db.query(countSql, [eventId], (countErr, countResult) => {
//             if (countErr) {
//                 console.error('Error checking current registrations:', countErr);
//                 return db.rollback(() => {
//                     res.status(500).json({ error: 'Database error checking registrations' });
//                 });
//             }

//             const currentRegistrations = countResult[0]?.currentRegistrations || 0;
            
//             // Don't allow reducing max participants below current registrations
//             if (maxParticipants < currentRegistrations) {
//                 return db.rollback(() => {
//                     res.status(400).json({ 
//                         error: `Cannot reduce maximum participants below current registrations (${currentRegistrations})` 
//                     });
//                 });
//             }

//             // Update Event table
//             const eventSql = `
//                 UPDATE Event 
//                 SET 
//                     EventName = ?,
//                     Category = ?,
//                     Description = ?,
//                     Rules = ?,
//                     OrganizerID = ?,
//                     RegistrationFee = ?,
//                     MaxParticipants = ?
//                 WHERE EventID = ?
//             `;

//             db.query(
//                 eventSql, 
//                 [eventName, category, description, rules, organizerId, registrationFee, maxParticipants, eventId],
//                 (eventErr, eventResult) => {
//                     if (eventErr) {
//                         console.error('Error updating event:', eventErr);
//                         return db.rollback(() => {
//                             res.status(500).json({ error: 'Failed to update event' });
//                         });
//                     }
                    
//                     if (eventResult.affectedRows === 0) {
//                         return db.rollback(() => {
//                             res.status(404).json({ error: 'Event not found' });
//                         });
//                     }
                    
//                     // Update EventVenue table
//                     const venueSql = `
//                         UPDATE EventVenue 
//                         SET VenueID = ?, EventDateTime = ?
//                         WHERE EventID = ?
//                     `;
                    
//                     db.query(venueSql, [venueId, dateTime, eventId], (venueErr, venueResult) => {
//                         if (venueErr) {
//                             console.error('Error updating event venue:', venueErr);
//                             return db.rollback(() => {
//                                 res.status(500).json({ error: 'Failed to update event venue' });
//                             });
//                         }
                        
//                         // Commit the transaction
//                         db.commit((commitErr) => {
//                             if (commitErr) {
//                                 console.error('Error committing transaction:', commitErr);
//                                 return db.rollback(() => {
//                                     res.status(500).json({ error: 'Failed to save event updates' });
//                                 });
//                             }
                            
//                             console.log(`Event ${eventId} updated successfully`);
//                             res.status(200).json({ 
//                                 message: 'Event updated successfully',
//                                 eventId: eventId
//                             });
//                         });
//                     });
//                 }
//             );
//         });
//     });
// });

//  participant dashboard 

 // to participant profile information
app.get('/api/participant/profile', (req, res) => {
    const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
    
    db.query(userSql, (err, users) => {
        if (err) {
            console.error('Error fetching current user:', err);
            return res.status(500).json({ error: 'Database error fetching current user' });
        }
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'No logged in user found' });
        }
        
        const userId = users[0].id;
        
        const profileSql = `
            SELECT u.UserID, u.FirstName, u.MiddleName, u.LastName, u.Email, u.city, 
                   p.University, p.TeamName
            FROM _USER u
            JOIN Participant p ON u.UserID = p.ParticipantID
            WHERE u.UserID = ?
        `;
        
        db.query(profileSql, [userId], (profileErr, profile) => {
            if (profileErr) {
                console.error('Error fetching participant profile:', profileErr);
                return res.status(500).json({ error: 'Database error fetching participant profile' });
            }
            
            if (profile.length === 0) {
                console.log(`No participant profile found for user ID: ${userId}`);
                return res.status(404).json({ error: 'Participant profile not found' });
            }
            
            const countSql = "SELECT COUNT(*) as eventCount FROM EventParticipation WHERE ParticipantID = ?";
            db.query(countSql, [userId], (countErr, countResult) => {
                if (countErr) {
                    console.error('Error counting registered events:', countErr);
                    profile[0].eventCount = 0;
                    return res.json(profile[0]);
                }
                
                profile[0].eventCount = countResult[0].eventCount || 0;
                return res.json(profile[0]);
            });
        });
    });
});

 // to participant registered events
app.get('/api/participant/events', (req, res) => {
    const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
    
    db.query(userSql, (err, users) => {
        if (err) {
            console.error('Error fetching current user:', err);
            return res.status(500).json({ error: 'Database error fetching current user' });
        }
        
        if (users.length === 0) {
            console.log('No logged in user found');
            return res.status(401).json({ error: 'No logged in user found' });
        }
        
        const userId = users[0].id;
        
        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        const upcomingSql = `
            SELECT e.EventID, e.EventName, e.Category, ev.EventDateTime as eventDate, 
                   v.VenueName, e.Description, e.RegistrationFee
            FROM Event e
            JOIN EventParticipation ep ON e.EventID = ep.EventID
            JOIN EventVenue ev ON e.EventID = ev.EventID
            JOIN Venue v ON ev.VenueID = v.VenueID
            WHERE ep.ParticipantID = ? AND ev.EventDateTime >= ?
            ORDER BY ev.EventDateTime ASC
        `;
        
        const pastSql = `
            SELECT e.EventID, e.EventName, e.Category, ev.EventDateTime as eventDate, 
                   v.VenueName, e.Description, e.RegistrationFee
            FROM Event e
            JOIN EventParticipation ep ON e.EventID = ep.EventID
            JOIN EventVenue ev ON e.EventID = ev.EventID
            JOIN Venue v ON ev.VenueID = v.VenueID
            WHERE ep.ParticipantID = ? AND ev.EventDateTime < ?
            ORDER BY ev.EventDateTime DESC
        `;
        
        db.query(upcomingSql, [userId, currentDate], (upcomingErr, upcomingEvents) => {
            if (upcomingErr) {
                console.error('Error fetching upcoming events:', upcomingErr);
                return res.status(500).json({ error: 'Database error fetching upcoming events' });
            }
            
            db.query(pastSql, [userId, currentDate], (pastErr, pastEvents) => {
                if (pastErr) {
                    console.error('Error fetching past events:', pastErr);
                    return res.status(500).json({ error: 'Database error fetching past events' });
                }
                
                return res.json({
                    upcoming: upcomingEvents,
                    past: pastEvents
                });
            });
        });
    });
});

 // to available events for registration
app.get('/api/participant/available-events', (req, res) => {
    const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
    
    db.query(userSql, (err, users) => {
        if (err) {
            console.error('Error fetching current user:', err);
            return res.status(500).json({ error: 'Database error fetching current user' });
        }
        
        if (users.length === 0) {
            console.log('No logged in user found');
            return res.status(401).json({ error: 'No logged in user found' });
        }
        
        const userId = users[0].id;
        console.log(`Fetching available events for user ID: ${userId}`);
        
        const sql = `
            SELECT e.EventID, e.EventName, e.Category, e.Description, ev.EventDateTime as eventDate, 
                   v.VenueName, e.RegistrationFee, e.MaxParticipants,
                   (SELECT COUNT(*) FROM EventParticipation ep WHERE ep.EventID = e.EventID) as RegisteredCount
            FROM Event e
            JOIN EventVenue ev ON e.EventID = ev.EventID
            JOIN Venue v ON ev.VenueID = v.VenueID
            WHERE e.EventID NOT IN (
                SELECT EventID FROM EventParticipation WHERE ParticipantID = ?
            )
            HAVING RegisteredCount < e.MaxParticipants
            ORDER BY ev.EventDateTime ASC
        `;
        
        db.query(sql, [userId], (eventErr, events) => {
            if (eventErr) {
                console.error('Error fetching available events:', eventErr);
                return res.status(500).json({ error: 'Database error fetching available events' });
            }
            
            console.log(`Found ${events.length} available events for registration`);
            return res.json(events);
        });
    });
});

// Register participant for an event
app.post('/api/participant/register-event', (req, res) => {
    const eventId = req.body.eventId;
    
    if (!eventId) {
        console.error('Missing event ID in request body');
        return res.status(400).json({ error: 'Event ID is required' });
    }
    
    const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
    
    db.query(userSql, (err, users) => {
        if (err) {
            console.error('Error fetching current user:', err);
            return res.status(500).json({ error: 'Database error fetching current user' });
        }
        
        if (users.length === 0) {
            console.log('No logged in user found');
            return res.status(401).json({ error: 'No logged in user found' });
        }
        
        const userId = users[0].id;
        
        const checkSql = "SELECT * FROM EventParticipation WHERE EventID = ? AND ParticipantID = ?";
        db.query(checkSql, [eventId, userId], (checkErr, registrations) => {
            if (checkErr) {
                console.error('Error checking existing registration:', checkErr);
                return res.status(500).json({ error: 'Database error checking registration' });
            }
            
            if (registrations.length > 0) {
                console.log(`User ${userId} is already registered for event ${eventId}`);
                return res.status(400).json({ error: 'Already registered for this event' });
            }
            
            const countSql = `
                SELECT e.MaxParticipants, COUNT(ep.ParticipantID) as RegisteredCount
                FROM Event e
                LEFT JOIN EventParticipation ep ON e.EventID = ep.EventID
                WHERE e.EventID = ?
                GROUP BY e.EventID
            `;
            
            db.query(countSql, [eventId], (countErr, countResults) => {
                if (countErr) {
                    console.error('Error checking event capacity:', countErr);
                    return res.status(500).json({ error: 'Database error checking event capacity' });
                }
                
                if (countResults.length === 0) {
                    return res.status(404).json({ error: 'Event not found' });
                }
                
                const maxParticipants = countResults[0].MaxParticipants;
                const registeredCount = countResults[0].RegisteredCount;
                
                if (registeredCount >= maxParticipants) {
                    return res.status(400).json({ error: 'Event is full' });
                }
                
                const registerSql = `INSERT INTO EventParticipation (EventID, ParticipantID, RegistrationDateTime) VALUES (?, ?, NOW())`;
                db.query(registerSql, [eventId, userId], (registerErr, result) => {
                    if (registerErr) {
                        console.error('Error registering for event:', registerErr);
                        return res.status(500).json({ error: 'Database error during registration' });
                    }
                    
                    return res.status(201).json({ message: 'Registration successful' });
                });
            });
        });
    });
});

module.exports = app;

 // to all events for explore/available events section
app.get('/api/events', (req, res) => {
    const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
    
    db.query(userSql, (err, users) => {
        if (err) {
            console.error('Error fetching current user:', err);
            return res.status(500).json({ error: 'Database error fetching current user' });
        }
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'No logged in user found' });
        }
        
        const userId = users[0].id;
        
        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        const sql = `
            SELECT e.EventID, e.EventName, e.Category, e.Description, e.MaxParticipants, e.RegistrationFee,
                   ev.EventDateTime as DateTime, v.VenueName, 
                   (SELECT COUNT(*) FROM EventParticipation WHERE EventID = e.EventID) as RegisteredParticipants
            FROM Event e
            JOIN EventVenue ev ON e.EventID = ev.EventID
            JOIN Venue v ON ev.VenueID = v.VenueID
            WHERE ev.EventDateTime >= ?
            ORDER BY ev.EventDateTime ASC
        `;
        
        db.query(sql, [currentDate], (eventErr, events) => {
            if (eventErr) {
                console.error('Error fetching events:', eventErr);
                return res.status(500).json({ error: 'Database error fetching events' });
            }
            
            return res.json(events);
        });
    });
});

 // to events registered by the current user
app.get('/api/events/registered/me', (req, res) => {
    const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
    
    db.query(userSql, (err, users) => {
        if (err) {
            console.error('Error fetching current user:', err);
            return res.status(500).json({ error: 'Database error fetching current user' });
        }
        
        if (users.length === 0) {
            console.log('No logged in user found');
            return res.status(401).json({ error: 'No logged in user found' });
        }
        
        const userId = users[0].id;
        console.log(`Fetching registered events for user ID: ${userId}`);
        
        const sql = `
            SELECT e.EventID, e.EventName, e.Category, e.Description, e.RegistrationFee,
                   ev.EventDateTime as DateTime, v.VenueName
            FROM Event e
            JOIN EventParticipation ep ON e.EventID = ep.EventID
            JOIN EventVenue ev ON e.EventID = ev.EventID
            JOIN Venue v ON ev.VenueID = v.VenueID
            WHERE ep.ParticipantID = ?
            ORDER BY ev.EventDateTime ASC
        `;
        
        db.query(sql, [userId], (eventErr, events) => {
            if (eventErr) {
                console.error('Error fetching registered events:', eventErr);
                return res.status(500).json({ error: 'Database error fetching registered events' });
            }
            
            console.log(`Found ${events.length} registered events for user ${userId}`);
            return res.json(events);
        });
    });
});

//  to register for an event
app.post('/api/events/:eventId/register', (req, res) => {
    const eventId = req.params.eventId;
    
    if (!eventId) {
        return res.status(400).json({ message: 'Event ID is required' });
    }
    
    const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
    
    db.query(userSql, (err, users) => {
        if (err) {
            console.error('Error fetching current user:', err);
            return res.status(500).json({ message: 'Database error fetching current user' });
        }
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'No logged in user found' });
        }
        
        const userId = users[0].id;
        
        const checkSql = "SELECT * FROM EventParticipation WHERE EventID = ? AND ParticipantID = ?";
        db.query(checkSql, [eventId, userId], (checkErr, registrations) => {
            if (checkErr) {
                console.error('Error checking existing registration:', checkErr);
                return res.status(500).json({ message: 'Error checking registration' });
            }
            
            if (registrations.length > 0) {
                return res.status(400).json({ message: 'You are already registered for this event' });
            }
            
            // Check if event is full
            const countSql = `
                SELECT e.MaxParticipants, COUNT(ep.ParticipantID) as RegisteredCount
                FROM Event e
                LEFT JOIN EventParticipation ep ON e.EventID = ep.EventID
                WHERE e.EventID = ?
                GROUP BY e.EventID
            `;
            
            db.query(countSql, [eventId], (countErr, countResults) => {
                if (countErr) {
                    console.error('Error checking event capacity:', countErr);
                    return res.status(500).json({ message: 'Error checking event capacity' });
                }
                
                if (countResults.length === 0) {
                    return res.status(404).json({ message: 'Event not found' });
                }
                
                const maxParticipants = countResults[0].MaxParticipants;
                const registeredCount = countResults[0].RegisteredCount;
                
                if (registeredCount >= maxParticipants) {
                    return res.status(400).json({ message: 'This event is already at full capacity' });
                }
                
                const registerSql = "INSERT INTO EventParticipation (EventID, ParticipantID, RegistrationDateTime) VALUES (?, ?, NOW())";
                db.query(registerSql, [eventId, userId], (registerErr, result) => {
                    if (registerErr) {
                        console.error('Error registering for event:', registerErr);
                        return res.status(500).json({ message: 'Error registering for event' });
                    }
                    
                    return res.status(201).json({ 
                        message: 'Registration successful',
                        participationId: result.insertId
                    });
                });
            });
        });
    });
});

//  to load profile,
app.get('/loadprofile', (req, res) => {
    const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
    
    db.query(userSql, (err, users) => {
        if (err) {
            console.error('Error fetching current user:', err);
            return res.status(500).json({ error: 'Database error fetching current user' });
        }
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'No logged in user found' });
        }
        
        const userId = users[0].id;
        
        const profileSql = `
            SELECT u.UserID, u.FirstName, u.MiddleName, u.LastName, u.Email, u.city, 
                   p.University, t.TeamName, t.TeamID
            FROM _USER u
            JOIN Participant p ON u.UserID = p.ParticipantID
            LEFT JOIN Team t ON p.TeamID = t.TeamID
            WHERE u.UserID = ?
        `;
        
        db.query(profileSql, [userId], (profileErr, profiles) => {
            if (profileErr) {
                console.error('Error fetching participant profile:', profileErr);
                return res.status(500).json({ error: 'Database error fetching profile' });
            }
            
            if (profiles.length === 0) {
                return res.status(404).json({ error: 'Profile not found' });
            }
            
             // to phone numbers
            const phoneSql = "SELECT PhoneNumber FROM UserPhoneNumber WHERE UserID = ?";
            db.query(phoneSql, [userId], (phoneErr, phones) => {
                const profile = profiles[0];
                
                if (!phoneErr && phones.length > 0) {
                    profile.phoneNumbers = phones.map(p => p.PhoneNumber);
                } else {
                    profile.phoneNumbers = [];
                }
                
                // if there is a team
                if (profile.TeamID) {
                    profile.team = {
                        TeamID: profile.TeamID,
                        TeamName: profile.TeamName
                    };
                }
                
                delete profile.TeamID;
                delete profile.TeamName;
                
                return res.json(profile);
            });
        });
    });
});
app.post('/events/:id', (req, res) => {
  const eventId = req.params.id;
  const { 
      eventName, 
      category, 
      description, 
      rules, 
      dateTime, 
      venueId, 
      maxParticipants, 
      registrationFee,
      organizerId,
      judgeIds
  } = req.body;
  
  db.beginTransaction((transErr) => {
      if (transErr) {
          console.error('Error starting transaction:', transErr);
          return res.status(500).json({ error: 'Database transaction error' });
      }
      
      const eventSql = `
          UPDATE Event 
          SET EventName = ?, Category = ?, Description = ?, Rules = ?, 
              RegistrationFee = ?, MaxParticipants = ?, OrganizerID = ?
          WHERE EventID = ?
      `;
      
      db.query(
          eventSql, 
          [eventName, category, description, rules, registrationFee, maxParticipants, organizerId, eventId], 
          (eventErr, eventResult) => {
              if (eventErr) {
                  console.error('Error updating event:', eventErr);
                  return res.status(500).json({ error: 'Database error updating event' });
              }
              
              const venueSql = `
                  UPDATE EventVenue 
                  SET VenueID = ?, EventDateTime = ?
                  WHERE EventID = ?
              `;
              
              db.query(venueSql, [venueId, dateTime, eventId], (venueErr, venueResult) => {
                  if (venueErr) {
                      console.error('Error updating event venue:', venueErr);
                      return  res.status(500).json({ error: 'Database error updating event venue' });
                  }
                  
                  const deleteJudgesSql = `DELETE FROM JudgeEvent WHERE EventID = ?`;
                  
                  db.query(deleteJudgesSql, [eventId], (deleteErr) => {
                      if (deleteErr) {
                          console.error('Error removing existing judge assignments:', deleteErr);
                          return db.rollback(() => {
                              res.status(500).json({ error: 'Database error updating judge assignments' });
                          });
                      }
                      
                      // Now add new judge assignments if any are selected
                      if (judgeIds && judgeIds.length > 0) {
                          const judgeValues = judgeIds.map(judgeId => [judgeId, eventId]);
                          
                          const judgesSql = `INSERT INTO JudgeEvent (JudgeID, EventID) VALUES ?`;
                          
                          db.query(judgesSql, [judgeValues], (judgesErr) => {
                              if (judgesErr) {
                                  console.error('Error assigning judges:', judgesErr);
                                  return 
                                      res.status(500).json({ error: 'Database error assigning judges' });
                                
                              }
                              
                              
                          });
                      } else {
                          // No judges to assign, commit transaction
                          db.commit(commitErr => {
                              if (commitErr) {
                                  console.error('Error committing transaction:', commitErr);
                                  return db.rollback(() => {
                                      res.status(500).json({ error: 'Database transaction error' });
                                  });
                              }
                              
                              res.status(200).json({ message: 'Event updated successfully' });
                          });
                      }
                  });
              });
          }
      );
  });
});
//  for judge dashboard functionality
app.get('/api/judge/dashboard', (req, res) => {
    console.log('Fetching judge dashboard data');
    
    const userSql = "SELECT * FROM currentLogin ";
    
    db.query(userSql, (err, users) => {
        if (err) {
            console.error('Error fetching current user:', err);
            return res.status(500).json({ error: 'Database error fetching current user' });
        }
        
        if (users.length === 0) {
            console.log('No logged in user found');
            return res.status(401).json({ error: 'No logged in user found' });
        }
        
        const judgeId = users[0].id;
        console.log(`Fetching dashboard for judge ID: ${judgeId}`);
        
        const assignedEventsSql = `
            SELECT COUNT(*) as count
            FROM JudgeEvent
            WHERE JudgeID = ?
        `;
        
        db.query(assignedEventsSql, [judgeId], (eventErr, eventResults) => {
            if (eventErr) {
                console.error('Error fetching assigned events count:', eventErr);
                return res.status(500).json({ error: 'Database error fetching assigned events count' });
            }
            
            const assignedEventsCount = eventResults[0]?.count || 0;
            
            const completedEvalsSql = `
                SELECT COUNT(*) as count
                FROM Evaluation
                WHERE JudgeID = ? AND Score IS NOT NULL
            `;
            
            db.query(completedEvalsSql, [judgeId], (evalErr, evalResults) => {
                if (evalErr) {
                    console.error('Error fetching completed evaluations count:', evalErr);
                    return res.status(500).json({ error: 'Database error fetching completed evaluations' });
                }
                
                const completedEvaluationsCount = evalResults[0]?.count || 0;
                
                const pendingEvaluationsCount = Math.max(0, assignedEventsCount - completedEvaluationsCount);
                
                const upcomingEventsSql = `
                    SELECT e.EventID as id, e.EventName as name, e.Category as category, 
                           ev.EventDateTime as date_time, v.VenueName as venue_name
                    FROM Event e
                    JOIN EventVenue ev ON e.EventID = ev.EventID
                    JOIN Venue v ON ev.VenueID = v.VenueID
                    JOIN JudgeEvent je ON e.EventID = je.EventID
                    WHERE je.JudgeID = ? 
                    ORDER BY ev.EventDateTime ASC
                    LIMIT 5
                `;
                
                db.query(upcomingEventsSql, [judgeId], (upcomingErr, upcomingEvents) => {
                    if (upcomingErr) {
                        console.error('Error fetching upcoming events:', upcomingErr);
                        return res.status(500).json({ error: 'Database error fetching upcoming events' });
                    }
                    
                    // Return all dashboard data
                    res.json({
                        assignedEventsCount,
                        completedEvaluationsCount,
                        pendingEvaluationsCount,
                        upcomingEvents
                    });
                });
            });
        });
    });
});

//  to get events assigned to a judge
app.get('/api/judge/events', (req, res) => {
    const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
    
    db.query(userSql, (err, users) => {
        if (err) {
            console.error('Error fetching current user:', err);
            return res.status(500).json({ error: 'Database error fetching current user' });
        }
        
        if (users.length === 0) {
            console.log('No logged in user found');
            return res.status(401).json({ error: 'No logged in user found' });
        }
        
        const judgeId = users[0].id;
        
        const eventsSql = `
            SELECT e.EventID, e.EventName, e.Category, ev.EventDateTime, v.VenueName,
                   (SELECT COUNT(*) FROM Evaluation WHERE EventID = e.EventID AND JudgeID = ? AND Score IS NOT NULL) as ScoredCount
            FROM Event e
            JOIN JudgeEvent je ON e.EventID = je.EventID
            JOIN EventVenue ev ON e.EventID = ev.EventID
            JOIN Venue v ON ev.VenueID = v.VenueID
            WHERE je.JudgeID = ?
            ORDER BY ev.EventDateTime ASC
        `;
        
        db.query(eventsSql, [judgeId, judgeId], (eventErr, events) => {
            if (eventErr) {
                console.error('Error fetching judge events:', eventErr);
                return res.status(500).json({ error: 'Database error fetching judge events' });
            }
            
            const now = new Date();
            const upcoming = [];
            const past = [];
            
            events.forEach(event => {
                const eventDate = new Date(event.EventDateTime);
                if (eventDate > now) {
                    upcoming.push(event);
                } else {
                    past.push(event);
                }
            });
            
            res.json({
                upcoming,
                past
            });
        });
    });
});

//   to get event details for scoring
app.get('/api/judge/events/:eventId', (req, res) => {
    const eventId = req.params.eventId;
    
    const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
    
    db.query(userSql, (err, users) => {
        if (err) {
            console.error('Error fetching current user:', err);
            return res.status(500).json({ error: 'Database error fetching current user' });
        }
        
        if (users.length === 0) {
            console.log('No logged in user found');
            return res.status(401).json({ error: 'No logged in user found' });
        }
        
        const judgeId = users[0].id;
        
        const checkSql = "SELECT * FROM JudgeEvent WHERE EventID = ? AND JudgeID = ?";
        
        db.query(checkSql, [eventId, judgeId], (checkErr, assignments) => {
            if (checkErr) {
                console.error('Error checking judge assignment:', checkErr);
                return res.status(500).json({ error: 'Database error checking judge assignment' });
            }
            
            if (assignments.length === 0) {
                return res.status(403).json({ error: 'You are not assigned to judge this event' });
            }
            
             // to event details
            const eventSql = `
                SELECT e.EventID, e.EventName, e.Category, e.Description, e.Rules,
                       ev.EventDateTime, v.VenueName, v.Location
                FROM Event e
                JOIN EventVenue ev ON e.EventID = ev.EventID
                JOIN Venue v ON ev.VenueID = v.VenueID
                WHERE e.EventID = ?
            `;
            
            db.query(eventSql, [eventId], (eventErr, events) => {
                if (eventErr) {
                    console.error('Error fetching event details:', eventErr);
                    return res.status(500).json({ error: 'Database error fetching event details' });
                }
                
                if (events.length === 0) {
                    return res.status(404).json({ error: 'Event not found' });
                }
                
                const event = events[0];
                
                const participantsSql = `
                    SELECT p.ParticipantID, u.FirstName, u.LastName,
                           ev.Score, ev.Comments
                    FROM EventParticipation ep
                    JOIN Participant p ON ep.ParticipantID = p.ParticipantID
                    JOIN _USER u ON p.ParticipantID = u.UserID
                    LEFT JOIN Evaluation ev ON ep.EventID = ev.EventID 
                         AND ep.ParticipantID = ev.ParticipantID 
                         AND ev.JudgeID = ?
                    WHERE ep.EventID = ?
                `;
                
                db.query(participantsSql, [judgeId, eventId], (partErr, participants) => {
                    if (partErr) {
                        console.error('Error fetching participants:', partErr);
                        return res.status(500).json({ error: 'Database error fetching participants' });
                    }
                    
                    event.participants = participants;
                    res.json(event);
                });
            });
        });
    });
});

app.post('/api/judge/score', (req, res) => {
    const { eventId, participantId, score, comments } = req.body;
    
    if (!eventId || !participantId || score === undefined) {
        return res.status(400).json({ error: 'Event ID, participant ID, and score are required' });
    }
    
    if (score < 0 || score > 10) {
        return res.status(400).json({ error: 'Score must be between 0 and 10' });
    }
    
    const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
    
    db.query(userSql, (err, users) => {
        if (err) {
            console.error('Error fetching current user:', err);
            return res.status(500).json({ error: 'Database error fetching current user' });
        }
        
        if (users.length === 0) {
            console.log('No logged in user found');
            return res.status(401).json({ error: 'No logged in user found' });
        }
        
        const judgeId = users[0].id;
        
        const checkSql = "SELECT * FROM JudgeEvent WHERE EventID = ? AND JudgeID = ?";
        
        db.query(checkSql, [eventId, judgeId], (checkErr, assignments) => {
            if (checkErr) {
                console.error('Error checking judge assignment:', checkErr);
                return res.status(500).json({ error: 'Database error checking judge assignment' });
            }
            
            if (assignments.length === 0) {
                return res.status(403).json({ error: 'You are not assigned to judge this event' });
            }
            
            const partSql = "SELECT * FROM EventParticipation WHERE EventID = ? AND ParticipantID = ?";
            
            db.query(partSql, [eventId, participantId], (partErr, participations) => {
                if (partErr) {
                    console.error('Error checking participant registration:', partErr);
                    return res.status(500).json({ error: 'Database error checking participant registration' });
                }
                
                if (participations.length === 0) {
                    return res.status(400).json({ error: 'Participant is not registered for this event' });
                }
                
                const evalSql = "SELECT * FROM Evaluation WHERE EventID = ? AND ParticipantID = ? AND JudgeID = ?";
                
                db.query(evalSql, [eventId, participantId, judgeId], (evalErr, evaluations) => {
                    if (evalErr) {
                        console.error('Error checking existing evaluation:', evalErr);
                        return res.status(500).json({ error: 'Database error checking existing evaluation' });
                    }
                    
                    let query;
                    let params;
                    
                    if (evaluations.length > 0) {
                        // Update existing evaluation
                        query = `
                            UPDATE Evaluation 
                            SET Score = ?, Comments = ?
                            WHERE EventID = ? AND ParticipantID = ? AND JudgeID = ?
                        `;
                        params = [score, comments || null, eventId, participantId, judgeId];
                    } else {
                        query = `
                            INSERT INTO Evaluation 
                            (EventID, ParticipantID, JudgeID, Score, Comments, RoundName) 
                            VALUES (?, ?, ?, ?, ?, ?)
                        `;
                        params = [eventId, participantId, judgeId, score, comments || null, 'Round 1'];
                    }
                    
                    db.query(query, params, (submitErr, result) => {
                        if (submitErr) {
                            console.error('Error submitting evaluation:', submitErr);
                            return res.status(500).json({ error: 'Database error submitting evaluation' });
                        }
                        
                        res.json({ 
                            message: 'Score submitted successfully',
                            evaluationId: evaluations.length > 0 ? evaluations[0].EvaluationID : result.insertId
                        });
                    });
                });
            });
        });
    });
});

//   for judge profile
app.get('/api/judge/profile', (req, res) => {
    const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
    
    db.query(userSql, (err, users) => {
        if (err) {
            console.error('Error fetching current user:', err);
            return res.status(500).json({ error: 'Database error fetching current user' });
        }
        
        if (users.length === 0) {
            console.log('No logged in user found');
            return res.status(401).json({ error: 'No logged in user found' });
        }
        
        const judgeId = users[0].id;
        
        const profileSql = `
            SELECT u.UserID, u.FirstName, u.MiddleName, u.LastName, u.Email, u.city,
                   j.Expertise, YearsExperience=1
            FROM _USER u
            JOIN Judge j ON u.UserID = j.JudgeID
            WHERE u.UserID = ?
        `;
        
        db.query(profileSql, [judgeId], (profileErr, profiles) => {
            if (profileErr) {
                console.error('Error fetching judge profile:', profileErr);
                return res.status(500).json({ error: 'Database error fetching profile' });
            }
            
            if (profiles.length === 0) {
                return res.status(404).json({ error: 'Judge profile not found' });
            }
            
            const profile = profiles[0];
            
            const phoneSql = "SELECT PhoneNumber FROM UserPhoneNumber WHERE UserID = ?";
            
            db.query(phoneSql, [judgeId], (phoneErr, phones) => {
                if (!phoneErr && phones.length > 0) {
                    profile.phoneNumbers = phones.map(p => p.PhoneNumber);
                } else {
                    profile.phoneNumbers = [];
                }
                
                const countSql = "SELECT COUNT(*) as count FROM JudgeEvent WHERE JudgeID = ?";
                
                db.query(countSql, [judgeId], (countErr, counts) => {
                    if (!countErr && counts.length > 0) {
                        profile.assignedEventsCount = counts[0].count;
                    } else {
                        profile.assignedEventsCount = 0;
                    }
                    
                    res.json(profile);
                });
            });
        });
    });
});



app.get('/api/judge/dashboard', (req, res) => {
    
    const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
    
    db.query(userSql, (err, users) => {
        if (err) {
            console.error('Error fetching current user:', err);
            return res.status(500).json({ error: 'Database error fetching current user' });
        }
        
        if (users.length === 0) {
            console.log('No logged in user found');
            return res.status(401).json({ error: 'No logged in user found' });
        }
        
        const judgeId = users[0].id;
        console.log(`Fetching dashboard for judge ID: ${judgeId}`);
        
        const assignedEventsSql = `
            SELECT COUNT(*) as count
            FROM JudgeEvent
            WHERE JudgeID = ?
        `;
        
        db.query(assignedEventsSql, [judgeId], (eventErr, eventResults) => {
            if (eventErr) {
                console.error('Error fetching assigned events count:', eventErr);
                return res.status(500).json({ error: 'Database error fetching assigned events count' });
            }
            
            const assignedEventsCount = eventResults[0]?.count || 0;
            
            const completedEvalsSql = `
                SELECT COUNT(*) as count
                FROM Evaluation
                WHERE JudgeID = ? AND Score IS NOT NULL
            `;
            
            db.query(completedEvalsSql, [judgeId], (evalErr, evalResults) => {
                if (evalErr) {
                    console.error('Error fetching completed evaluations count:', evalErr);
                    return res.status(500).json({ error: 'Database error fetching completed evaluations' });
                }
                
                const completedEvaluationsCount = evalResults[0]?.count || 0;
                
                const pendingEvaluationsCount = Math.max(0, assignedEventsCount - completedEvaluationsCount);
                
                const upcomingEventsSql = `
                    SELECT e.EventID as id, e.EventName as name, e.Category as category, 
                           ev.EventDateTime as date_time, v.VenueName as venue_name
                    FROM Event e
                    JOIN EventVenue ev ON e.EventID = ev.EventID
                    JOIN Venue v ON ev.VenueID = v.VenueID
                    JOIN JudgeEvent je ON e.EventID = je.EventID
                    WHERE je.JudgeID = ? AND ev.EventDateTime > NOW()
                    ORDER BY ev.EventDateTime ASC
                    LIMIT 5
                `;
                
                db.query(upcomingEventsSql, [judgeId], (upcomingErr, upcomingEvents) => {
                    if (upcomingErr) {
                        console.error('Error fetching upcoming events:', upcomingErr);
                        return res.status(500).json({ error: 'Database error fetching upcoming events' });
                    }
                    
                    return res.json({
                        assignedEventsCount,
                        completedEvaluationsCount,
                        pendingEvaluationsCount,
                        upcomingEvents
                    });
                });
            });
        });
    });
});

// app.get('/api/judge/dashboard', (req, res) => {
//     const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
    
//     db.query(userSql, (err, users) => {
//         if (err) {
//             console.error('Error fetching current user:', err);
//             return res.status(500).json({ error: 'Database error fetching current user' });
//         }
        
//         if (users.length === 0) {
//             return res.status(401).json({ error: 'No logged in user found' });
//         }
        
//         // For MVP purposes, return a mock dashboard until the database is populated
//         res.json({
//             assignedEventsCount: 3,
//             completedEvaluationsCount: 1,
//             pendingEvaluationsCount: 2,
//             upcomingEvents: [
//                 {
//                     id: 1,
//                     name: 'Programming Competition',
//                     category: 'Technical',
//                     date_time: '2023-12-15T10:00:00',
//                     venue_name: 'Computer Lab A'
//                 },
//                 {
//                     id: 2,
//                     name: 'Debate Contest',
//                     category: 'Academic',
//                     date_time: '2023-12-16T14:00:00',
//                     venue_name: 'Main Auditorium'
//                 },
//                 {
//                     id: 3,
//                     name: 'Business Plan Pitch',
//                     category: 'Business',
//                     date_time: '2023-12-17T11:30:00',
//                     venue_name: 'Conference Hall'
//                 }
//             ]
//             // recentActivity field removed
//         });
//     });
// });

// Fix the judge dashboard routes and update SQL queries


// Update the API endpoint for judge dashboard with corrected SQL
// app.get('/api/judge/dashboard', (req, res) => {
//     console.log('Fetching judge dashboard data');
    
//     const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
    
//     db.query(userSql, (err, users) => {
//         if (err) {
//             console.error('Error fetching current user:', err);
//             return res.status(500).json({ error: 'Database error fetching current user' });
//         }
        
//         if (users.length === 0) {
//             console.log('No logged in user found');
//             return res.status(401).json({ error: 'No logged in user found' });
//         }
        
//         const judgeId = users[0].id;
//         console.log(`Fetching dashboard for judge ID: ${judgeId}`);
        
//          // to assigned events count
//         const assignedEventsSql = `
//             SELECT COUNT(*) as count
//             FROM JudgeEvent
//             WHERE JudgeID = ?
//         `;
        
//         db.query(assignedEventsSql, [judgeId], (eventErr, eventResults) => {
//             if (eventErr) {
//                 console.error('Error fetching assigned events count:', eventErr);
//                 return res.status(500).json({ error: 'Database error fetching assigned events count' });
//             }
            
//             const assignedEventsCount = eventResults[0]?.count || 0;
            
//             const completedEvalsSql = `
//                 SELECT COUNT(*) as count
//                 FROM Evaluation
//                 WHERE JudgeID = ? AND Score IS NOT NULL
//             `;
            
//             db.query(completedEvalsSql, [judgeId], (evalErr, evalResults) => {
//                 if (evalErr) {
//                     console.error('Error fetching completed evaluations count:', evalErr);
//                     return res.status(500).json({ error: 'Database error fetching completed evaluations' });
//                 }
                
//                 const completedEvaluationsCount = evalResults[0]?.count || 0;
                
//                  // to pending evaluations count 
//                 const pendingEvaluationsCount = Math.max(0, assignedEventsCount - completedEvaluationsCount);
                
//                  // to upcoming events to judge
//                 const upcomingEventsSql = `
//                     SELECT e.EventID as id, e.EventName as name, e.Category as category, 
//                            ev.EventDateTime as date_time, v.VenueName as venue_name
//                     FROM Event e
//                     JOIN EventVenue ev ON e.EventID = ev.EventID
//                     JOIN Venue v ON ev.VenueID = v.VenueID
//                     JOIN JudgeEvent je ON e.EventID = je.EventID
//                     WHERE je.JudgeID = ? AND ev.EventDateTime > NOW()
//                     ORDER BY ev.EventDateTime ASC
//                     LIMIT 5
//                 `;
                
//                 db.query(upcomingEventsSql, [judgeId], (upcomingErr, upcomingEvents) => {
//                     if (upcomingErr) {
//                         console.error('Error fetching upcoming events:', upcomingErr);
//                         return res.status(500).json({ error: 'Database error fetching upcoming events' });
//                     }
                    
//                     // Return all dashboard data WITHOUT the recentActivity field
//                     return res.json({
//                         assignedEventsCount,
//                         completedEvaluationsCount,
//                         pendingEvaluationsCount,
//                         upcomingEvents
//                     });
//                 });
//             });
//         });
//     });
// });

app.get('/api/judge/events', (req, res) => {
    const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
    
    db.query(userSql, (err, users) => {
        if (err) {
            console.error('Error fetching current user:', err);
            return res.status(500).json({ error: 'Database error fetching current user' });
        }
        
        if (users.length === 0) {
            console.log('No logged in user found');
            return res.status(401).json({ error: 'No logged in user found' });
        }
        
        const judgeId = users[0].id;
        console.log(`Fetching events for judge ID: ${judgeId}`);
        
        const eventsSql = `
            SELECT e.EventID, e.EventName, e.Category, ev.EventDateTime, v.VenueName,
                   (SELECT COUNT(*) FROM Evaluation WHERE EventID = e.EventID AND JudgeID = ? AND Score IS NOT NULL) as ScoredCount
            FROM Event e
            JOIN JudgeEvent je ON e.EventID = je.EventID
            JOIN EventVenue ev ON e.EventID = ev.EventID
            JOIN Venue v ON ev.VenueID = v.VenueID
            WHERE je.JudgeID = ?
            ORDER BY ev.EventDateTime ASC
        `;
        
        db.query(eventsSql, [judgeId, judgeId], (eventErr, events) => {
            if (eventErr) {
                console.error('Error fetching judge events:', eventErr);
                return res.status(500).json({ error: 'Database error fetching judge events' });
            }
            
            // Process events into categories: upcoming, ongoing, past
            const now = new Date();
            const upcoming = [];
            const past = [];
            
            events.forEach(event => {
                const eventDate = new Date(event.EventDateTime);
                if (eventDate > now) {
                    upcoming.push(event);
                } else {
                    past.push(event);
                }
            });
            
            res.json({
                upcoming,
                past
            });
        });
    });
});
//.
app.post('/signup', (req, res) => {
    const { firstName, middleName, lastName, email, phone, city, userType, password, roleInfo } = req.body;
    
    if (!firstName || !lastName || !email || !phone || !city || !userType || !password) {
        return res.status(400).json({ message: 'All required fields must be filled' });
    }
    
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
    
    console.log('Processing signup request for:', email);
    
    const checkEmailSql = "SELECT * FROM _USER WHERE Email = ?";
    db.query(checkEmailSql, [email], (checkErr, existingUsers) => {
        if (checkErr) {
            console.error('Error checking existing email:', checkErr);
            return res.status(500).json({ message: 'Database error checking email' });
        }
        
        if (existingUsers && existingUsers.length > 0) {
            console.log('Email already exists:', email);
            return res.status(409).json({ message: 'A user with this email already exists' });
        }
        
        db.beginTransaction(err => {
            if (err) {
                console.error('Error starting transaction:', err);
                return res.status(500).json({ message: 'Database error' });
            }
            
            const insertUserSql = "INSERT INTO _USER (FirstName, MiddleName, LastName, Email, city, Password) VALUES (?, ?, ?, ?, ?, ?)";
            db.query(insertUserSql, [firstName, middleName || null, lastName, email, city, password], (userErr, userResult) => {
                if (userErr) {
                    console.error('Error creating user:', userErr);
                    return db.rollback(() => {
                        res.status(500).json({ message: 'Error creating user account' });
                    });
                }
                
                const userId = userResult.insertId;
                
                const phoneNumberSql = "INSERT INTO USER_PHONE_NUMBER (UserID, PhoneNumber) VALUES (?, ?)";
                db.query(phoneNumberSql, [userId, phone], (phoneErr) => {
                    if (phoneErr) {
                        console.error('Error adding phone number:', phoneErr);
                        return db.rollback(() => {
                            res.status(500).json({ message: 'Error adding phone number' });
                        });
                    }
                    
                    if (userType === 'participant') {
                        if (!roleInfo || !roleInfo.teamName) {
                            return db.rollback(() => {
                                res.status(400).json({ message: 'Team name is required for participants' });
                            });
                        }
                        
                        const teamSql = "SELECT TeamID FROM Team WHERE TeamName = ?";
                        db.query(teamSql, [roleInfo.teamName], (teamErr, teams) => {
                            if (teamErr) {
                                console.error('Error checking team:', teamErr);
                                return db.rollback(() => {
                                    res.status(500).json({ message: 'Error checking team' });
                                });
                            }
                            
                            if (teams && teams.length > 0) {
                                const teamId = teams[0].TeamID;
                                insertParticipant(teamId);
                            } else {
                                const createTeamSql = "INSERT INTO Team (TeamName) VALUES (?)";
                                db.query(createTeamSql, [roleInfo.teamName], (createTeamErr, createTeamResult) => {
                                    if (createTeamErr) {
                                        console.error('Error creating team:', createTeamErr);
                                        return db.rollback(() => {
                                            res.status(500).json({ message: 'Error creating team' });
                                        });
                                    }
                                    
                                    insertParticipant(createTeamResult.insertId);
                                });
                            }
                            
                            function insertParticipant(teamId) {
                                const university = roleInfo && roleInfo.university ? roleInfo.university : null;
                                const participantSql = "INSERT INTO Participant (ParticipantID, TeamID, University) VALUES (?, ?, ?)";
                                
                                db.query(participantSql, [userId, teamId, university], (participantErr) => {
                                    if (participantErr) {
                                        console.error('Error creating participant:', participantErr);
                                        return db.rollback(() => {
                                            res.status(500).json({ message: 'Error creating participant account' });
                                        });
                                    }
                                    
                                   
                                        
                                        console.log(`Successfully created participant account for ${email}`);
                                        return res.status(201).json({
                                            message: 'Account created successfully',
                                            userId: userId
                                        });
                                });
                            }
                        });
                    } else if (userType === 'judge') {
                        const expertise = roleInfo && roleInfo.expertise ? roleInfo.expertise : null;
                        const judgeSql = "INSERT INTO Judge (JudgeID, Expertise) VALUES (?, ?)";
                        
                        db.query(judgeSql, [userId, expertise], (judgeErr) => {
                            if (judgeErr) {
                                console.error('Error creating judge:', judgeErr);
                                return db.rollback(() => {
                                    res.status(500).json({ message: 'Error creating judge account' });
                                });
                            }
                            
                            // Commit the transaction
                            db.commit(err => {
                                if (err) {
                                    console.error('Error committing transaction:', err);
                                    return db.rollback(() => {
                                        res.status(500).json({ message: 'Error creating account' });
                                    });
                                }
                                
                                console.log(`Successfully created judge account for ${email}`);
                                return res.status(201).json({
                                    message: 'Account created successfully',
                                    userId: userId
                                });
                            });
                        });
                    } else if (userType === 'organizer') {
                        // Insert into EventOrganizer table
                        const experience = roleInfo && roleInfo.experience ? roleInfo.experience : 0;
                        const organizerSql = "INSERT INTO EventOrganizer (OrganizerID, Experience) VALUES (?, ?)";
                        
                        db.query(organizerSql, [userId, experience], (organizerErr) => {
                            if (organizerErr) {
                                console.error('Error creating organizer:', organizerErr);
                                return db.rollback(() => {
                                    res.status(500).json({ message: 'Error creating organizer account' });
                                });
                            }
                            
                            // Commit the transaction
                            db.commit(err => {
                                if (err) {
                                    console.error('Error committing transaction:', err);
                                    return db.rollback(() => {
                                        res.status(500).json({ message: 'Error creating account' });
                                    });
                                }
                                
                                console.log(`Successfully created organizer account for ${email}`);
                                return res.status(201).json({
                                    message: 'Account created successfully',
                                    userId: userId
                                });
                            });
                        });
                    } else if (userType === 'sponsor') {
                        // Insert into Sponsor table
                        const sponsorName = roleInfo && roleInfo.sponsorName ? roleInfo.sponsorName : '';
                        const companyName = roleInfo && roleInfo.companyName ? roleInfo.companyName : '';
                        const contractDetails = roleInfo && roleInfo.contractDetails ? roleInfo.contractDetails : null;
                        
                        const sponsorSql = "INSERT INTO Sponsor (SponsorID, SponsorName, CompanyName, ContractDetail) VALUES (?, ?, ?, ?)";
                        db.query(sponsorSql, [userId, sponsorName, companyName, contractDetails], (sponsorErr) => {
                            if (sponsorErr) {
                                console.error('Error creating sponsor:', sponsorErr);
                                return db.rollback(() => {
                                    res.status(500).json({ message: 'Error creating sponsor account' });
                                });
                            }
                            
                            // Commit the transaction
                            db.commit(err => {
                                if (err) {
                                    console.error('Error committing transaction:', err);
                                    return db.rollback(() => {
                                        res.status(500).json({ message: 'Error creating account' });
                                    });
                                }
                                
                                console.log(`Successfully created sponsor account for ${email}`);
                                return res.status(201).json({
                                    message: 'Account created successfully',
                                    userId: userId
                                });
                            });
                        });
                    } else {
                        // Invalid user type
                        return db.rollback(() => {
                            res.status(400).json({ message: 'Invalid user type' });
                        });
                    }
                });
            });
        });
    });
});


 // to sponsorship packages
app.get('/api/sponsor/packages', (req, res) => {
  
  const sql = `
    SELECT s.SponsorshipID, s.ContractDetails, s.PurchaseDate, s.PaymentStatus, 
           u.FirstName, u.LastName, u.Email 
    FROM Sponsorship s 
    JOIN Sponsor sp ON s.SponsorID = sp.SponsorID
    JOIN _USER u ON sp.SponsorID = u.UserID
    ORDER BY s.PurchaseDate DESC
  `;
  
  db.query(sql, (err, packages) => {
    if (err) {
      console.error('Error fetching sponsorship packages:', err);
      return res.status(500).json({ error: 'Database error fetching sponsorship packages' });
    }
    
    res.json(packages);
  });
});

 // to sponsor purchased sponsorships
app.get('/api/sponsor/my-packages', (req, res) => {
  const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
  
  db.query(userSql, (err, users) => {
    if (err) {
      console.error('Error fetching current user:', err);
      return res.status(500).json({ error: 'Database error fetching current user' });
    }
    
    if (users.length === 0) {
      console.log('No logged in user found');
      return res.status(401).json({ error: 'No logged in user found' });
    }
    
    const sponsorId = users[0].id;
    
    const sql = `
      SELECT SponsorshipID, ContractDetails, PurchaseDate, PaymentStatus
      FROM Sponsorship
      WHERE SponsorID = ?
      ORDER BY PurchaseDate DESC
    `;
    
    db.query(sql, [sponsorId], (err, packages) => {
      if (err) {
        console.error('Error fetching sponsor packages:', err);
        return res.status(500).json({ error: 'Database error fetching sponsor packages' });
      }
      
      console.log(`Found ${packages.length} packages for sponsor ID: ${sponsorId}`);
      res.json(packages);
    });
  });
});

// to  total sponsorship amount
app.get('/api/sponsor/total-payment', (req, res) => {
  const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
  
  db.query(userSql, (err, users) => {
    if (err) {
      console.error('Error fetching current user:', err);
      return res.status(500).json({ error: 'Database error fetching current user' });
    }
    
    if (users.length === 0) {
      console.log('No logged in user found');
      return res.status(401).json({ error: 'No logged in user found' });
    }
    
    const sponsorId = users[0].id;
    
    const sql = `
      SELECT COUNT(*) as count
      FROM Sponsorship
      WHERE SponsorID = ? AND PaymentStatus = 'Completed'
    `;
    
    db.query(sql, [sponsorId], (err, result) => {
      if (err) {
        console.error('Error calculating total payments:', err);
        return res.status(500).json({ error: 'Database error calculating total payments' });
      }
      
      const count = result[0].count || 0;
      console.log(`Sponsor ID ${sponsorId} has ${count} completed sponsorships`);
      res.json({ count });
    });
  });
});

// create a new sponsorship
app.post('/api/sponsor/purchase-package', (req, res) => {
  const { contractDetails } = req.body;
  
  if (!contractDetails) {
    console.error('Missing contract details in request body');
    return res.status(400).json({ error: 'Contract details are required' });
  }
  
  const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
  
  db.query(userSql, (err, users) => {
    if (err) {
      console.error('Error fetching current user:', err);
      return res.status(500).json({ error: 'Database error fetching current user' });
    }
    
    if (users.length === 0) {
      console.log('No logged in user found');
      return res.status(401).json({ error: 'No logged in user found' });
    }
    
    const sponsorId = users[0].id;
    
    const sql = `
      INSERT INTO Sponsorship 
      (SponsorID, ContractDetails, PurchaseDate, PaymentStatus) 
      VALUES (?, ?, NOW(), 'Completed')
    `;
    
    db.query(sql, [sponsorId, contractDetails], (insertErr, result) => {
      if (insertErr) {
        console.error('Error creating sponsorship:', insertErr);
        return res.status(500).json({ error: 'Database error creating sponsorship' });
      }
      
      console.log(`Created sponsorship for sponsor ID ${sponsorId}`);
      
      const selectSql = `SELECT * FROM Sponsorship WHERE SponsorshipID = ?`;
      db.query(selectSql, [result.insertId], (selectErr, sponsorships) => {
        if (selectErr || sponsorships.length === 0) {
          console.error('Error fetching created sponsorship:', selectErr);
          return res.status(201).json({
            message: 'Sponsorship created successfully',
            sponsorshipId: result.insertId
          });
        }
        
        res.status(201).json({
          message: 'Sponsorship created successfully',
          sponsorshipId: result.insertId,
          sponsorship: sponsorships[0]
        });
      });
    });
  });
});

 // to sponsor purchased sponsorships with clear naming
 //.
app.get('/api/sponsor/my-packages', (req, res) => {
  const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
  
  db.query(userSql, (err, users) => {
    if (err) {
      console.error('Error fetching current user:', err);
      return res.status(500).json({ error: 'Database error fetching current user' });
    }
    
    if (users.length === 0) {
      console.log('No logged in user found');
      return res.status(401).json({ error: 'No logged in user found' });
    }
    
    const sponsorId = users[0].id;
    
    const sql = `
      SELECT SponsorshipID, ContractDetails, PurchaseDate, PaymentStatus
      FROM Sponsorship
      WHERE SponsorID = ?
      ORDER BY PurchaseDate DESC
    `;
    
    db.query(sql, [sponsorId], (err, packages) => {
      if (err) {
        console.error('Error fetching sponsor packages:', err);
        return res.status(500).json({ error: 'Database error fetching sponsor packages' });
      }
      
      console.log(`Found ${packages.length} packages for sponsor ID: ${sponsorId}`);
      
      const formattedPackages = packages.map(pkg => {
        let name = 'Sponsorship Package';
        let amountPaid = 0;
        
        if (pkg.ContractDetails) {
          const nameMatch = pkg.ContractDetails.match(/package: (.*?) for/);
          if (nameMatch && nameMatch[1]) {
            name = nameMatch[1];
          }
          
          const amountMatch = pkg.ContractDetails.match(/Rs (\d+)/);
          if (amountMatch && amountMatch[1]) {
            amountPaid = parseInt(amountMatch[1], 10);
          }
        }
        
        return {
          id: pkg.SponsorshipID,
          name: name,
          description: pkg.ContractDetails || 'No description available',
          amountPaid: amountPaid,
          paymentDate: new Date(pkg.PurchaseDate).toISOString().split('T')[0],
          status: pkg.PaymentStatus === 'Completed' ? 'Paid' : pkg.PaymentStatus
        };
      });
      
      res.json({
        sponsorshipPackages: formattedPackages,
        totalPayment: formattedPackages.reduce((total, pkg) => total + pkg.amountPaid, 0)
      });
    });
  });
});

 // to sponsor profile and sponsorship count
app.get('/api/sponsor/profile', (req, res) => {
  const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
  
  db.query(userSql, (err, users) => {
    if (err) {
      console.error('Error fetching current user:', err);
      return res.status(500).json({ error: 'Database error fetching current user' });
    }
    
    if (users.length === 0) {
      console.log('No logged in user found');
      return res.status(401).json({ error: 'No logged in user found' });
    }
    
    const sponsorId = users[0].id;
    
    const profileSql = `
      SELECT u.UserID, u.FirstName, u.MiddleName, u.LastName, u.Email, u.city
      FROM _USER u
      JOIN Sponsor s ON u.UserID = s.SponsorID
      WHERE u.UserID = ?
    `;
    
    db.query(profileSql, [sponsorId], (profileErr, profiles) => {
      if (profileErr) {
        console.error('Error fetching sponsor profile:', profileErr);
        return res.status(500).json({ error: 'Database error fetching profile' });
      }
      
      if (profiles.length === 0) {
        return res.status(404).json({ error: 'Sponsor profile not found' });
      }
      
      const profile = profiles[0];
      
      const countSql = "SELECT COUNT(*) as sponsorshipCount FROM Sponsorship WHERE SponsorID = ?";
      db.query(countSql, [sponsorId], (countErr, countResult) => {
        if (!countErr && countResult.length > 0) {
          profile.sponsorshipCount = countResult[0].sponsorshipCount || 0;
        } else {
          profile.sponsorshipCount = 0;
        }
        
        const completedSql = `
          SELECT COUNT(*) as completedCount
          FROM Sponsorship
          WHERE SponsorID = ? AND PaymentStatus = 'Completed'
        `;
        
        db.query(completedSql, [sponsorId], (completedErr, completedResult) => {
          if (!completedErr && completedResult.length > 0) {
            profile.completedSponsorships = completedResult[0].completedCount || 0;
          } else {
            profile.completedSponsorships = 0;
          }
          
          res.json(profile);
        });
      });
    });
  });
});

//  for user 

// View user details
app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  
  const sql = `
    SELECT u.UserID, u.FirstName, u.MiddleName, u.LastName, u.Email, u.city,
           p.PhoneNumber
    FROM _USER u
    LEFT JOIN USER_PHONE_NUMBER p ON u.UserID = p.UserID
    WHERE u.UserID = ?
  `;
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user details:', err);
      return res.status(500).json({ error: 'Database error fetching user details' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const roleCheckSql = `
      SELECT 
        CASE 
          WHEN EXISTS(SELECT 1 FROM Admin WHERE AdminID = ?) THEN 'admin'
          WHEN EXISTS(SELECT 1 FROM EventOrganizer WHERE OrganizerID = ?) THEN 'organizer'
          WHEN EXISTS(SELECT 1 FROM Judge WHERE JudgeID = ?) THEN 'judge'
          WHEN EXISTS(SELECT 1 FROM Participant WHERE ParticipantID = ?) THEN 'participant'
          WHEN EXISTS(SELECT 1 FROM Sponsor WHERE SponsorID = ?) THEN 'sponsor'
          ELSE 'unknown'
        END AS role
    `;
    
    db.query(roleCheckSql, [userId, userId, userId, userId, userId], (roleErr, roleResults) => {
      if (roleErr) {
        console.error('Error checking user role:', roleErr);
        return res.status(500).json({ error: 'Database error checking user role' });
      }
      
      const user = results[0];
      user.role = roleResults[0].role;
      
      res.json(user);
    });
  });
});
// update user
app.post('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const { firstName, middleName, lastName, email, city, phone } = req.body;
  
  if (!firstName || !lastName || !email || !city) {
    return res.status(400).json({ error: 'Missing required user information' });
  }
  
  const userSql = `
    UPDATE _USER 
    SET FirstName = ?, MiddleName = ?, LastName = ?, Email = ?, city = ?
    WHERE UserID = ?
  `;
  
  db.query(userSql, [firstName, middleName || null, lastName, email, city, userId], (userErr, userResult) => {
    if (userErr) {
      console.error('Error updating user:', userErr);
      return res.status(500).json({ error: 'Database error updating user' });
    }
    
    if (phone) {
      const phoneSql = `
        INSERT INTO USER_PHONE_NUMBER (UserID, PhoneNumber) 
        VALUES (?, ?) 
        ON DUPLICATE KEY UPDATE PhoneNumber = ?
      `;
      
      db.query(phoneSql, [userId, phone, phone], (phoneErr) => {
        if (phoneErr) {
          console.error('Error updating phone number:', phoneErr);
          return res.status(500).json({ error: 'Database error updating phone number' });
        }
        
        res.json({ message: 'User updated successfully' });
      });
    } else {
      res.json({ message: 'User updated successfully' });
    }
  });
});

// Delete user
//.
app.post('/api/users/:id/delete', (req, res) => {
  const userId = req.params.id;
  
  const currentUserSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
  
  db.query(currentUserSql, (err, users) => {
    if (err) {
      console.error('Error checking current user:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'No logged in user found' });
    }
    
    const currentUserId = users[0].id;
    
    if (parseInt(userId) === parseInt(currentUserId)) {
      return res.status(400).json({ error: 'Cannot delete your own account while logged in' });
    }
    
    const roleDeleteSqls = [
      "DELETE FROM Admin WHERE AdminID = ?",
      "DELETE FROM EventOrganizer WHERE OrganizerID = ?",
      "DELETE FROM Judge WHERE JudgeID = ?",
      "DELETE FROM Participant WHERE ParticipantID = ?",
      "DELETE FROM Sponsor WHERE SponsorID = ?"
    ];
    
    const associatedDataSqls = [
      "DELETE FROM USER_PHONE_NUMBER WHERE UserID = ?"
    ];
    
    Promise.all([
      ...roleDeleteSqls.map(sql => {
        return new Promise((resolve, reject) => {
          db.query(sql, [userId], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }),
      ...associatedDataSqls.map(sql => {
        return new Promise((resolve, reject) => {
          db.query(sql, [userId], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      })
    ])
    .then(() => {
      // Delete the user from _USER table
      const deleteUserSql = "DELETE FROM _USER WHERE UserID = ?";
      
      db.query(deleteUserSql, [userId], (deleteErr, deleteResult) => {
        if (deleteErr) {
          console.error('Error deleting user:', deleteErr);
          return res.status(500).json({ error: 'Database error deleting user' });
        }
        
        if (deleteResult.affectedRows === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
      });
    })
    .catch(error => {
      console.error('Error deleting user data:', error);
      res.status(500).json({ error: 'Database error deleting user data' });
    });
  });
});

app.get('/organizers', (req, res) => {
  const sql = `
    SELECT u.UserID, CONCAT(u.FirstName, ' ', u.LastName) AS Name, u.Email
    FROM _USER u
    JOIN EventOrganizer o ON u.UserID = o.OrganizerID
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching organizers:', err);
      return res.status(500).json({ error: 'Database error fetching organizers' });
    }
    
    res.json(results);
  });
});
// reports
app.get('/api/admin/reports/accommodation', (req, res) => {
  console.log('Generating accommodation allocation report');
  
  const sql = `
    SELECT a.BedNO as AccommodationID, a.RoomNumber as Type, 'Campus Hostel' as Location, 
           1 as AllocatedCount, 1 as Capacity,
           CONCAT(u.FirstName, ' ', u.LastName) as Participants
    FROM Accommodation a
    LEFT JOIN _USER u ON a.ParticipantID = u.UserID
    ORDER BY a.RoomNumber
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error generating accommodation report:', err);
      return res.status(500).json({ error: 'Database error generating accommodation report' });
    }
    
    const accommodations = results.map(row => {
      return {
        ...row,
        UtilizationRate: row.Capacity > 0 ? Math.round((row.AllocatedCount / row.Capacity) * 100) : 0,
        RemainingCapacity: Math.max(0, row.Capacity - row.AllocatedCount)
      };
    });
    
    const totalCapacity = accommodations.reduce((sum, acc) => sum + acc.Capacity, 0);
    const totalAllocated = accommodations.reduce((sum, acc) => sum + acc.AllocatedCount, 0);
    const overallUtilization = totalCapacity > 0 ? Math.round((totalAllocated / totalCapacity) * 100) : 0;
    
    const summary = {
      totalAccommodations: accommodations.length,
      totalCapacity,
      totalAllocated,
      overallUtilization,
      remainingCapacity: Math.max(0, totalCapacity - totalAllocated)
    };
    
    res.json({
      accommodations,
      summary
    });
  });
});

 // to participants grouped by event
app.get('/api/admin/reports/participants-by-event', (req, res) => {
  console.log('Generating participants by event report');
  
  const sql = `
    SELECT e.EventID, e.EventName, e.Category, 
           COUNT(ep.ParticipantID) as ParticipantCount,
           e.MaxParticipants,
           GROUP_CONCAT(CONCAT(u.FirstName, ' ', u.LastName) SEPARATOR ', ') as ParticipantList
    FROM Event e
    LEFT JOIN EventParticipation ep ON e.EventID = ep.EventID
    LEFT JOIN _USER u ON ep.ParticipantID = u.UserID
    GROUP BY e.EventID
    ORDER BY ParticipantCount DESC
  `;
  
  db.query(sql, (err, events) => {
    if (err) {
      console.error('Error generating participants by event report:', err);
      return res.status(500).json({ error: 'Database error generating participants report' });
    }
    
    const eventsWithStats = events.map(event => {
      return {
        ...event,
        FillRate: event.MaxParticipants > 0 ? Math.round((event.ParticipantCount / event.MaxParticipants) * 100) : 0,
        RemainingSpots: Math.max(0, event.MaxParticipants - event.ParticipantCount)
      };
    });
    
    const totalParticipants = eventsWithStats.reduce((sum, event) => sum + event.ParticipantCount, 0);
    const totalCapacity = eventsWithStats.reduce((sum, event) => sum + event.MaxParticipants, 0);
    const overallFillRate = totalCapacity > 0 ? Math.round((totalParticipants / totalCapacity) * 100) : 0;
    
    const categoryCounts = {};
    eventsWithStats.forEach(event => {
      if (!categoryCounts[event.Category]) {
        categoryCounts[event.Category] = 0;
      }
      categoryCounts[event.Category] += event.ParticipantCount;
    });
    
    const summary = {
      totalEvents: eventsWithStats.length,
      totalParticipants,
      totalCapacity,
      overallFillRate,
      categoryCounts
    };
    
    res.json({
      events: eventsWithStats,
      summary
    });
  });
});

 // to total revenue from registrations
 //.
app.get('/api/admin/reports/registration-revenue', (req, res) => {
  console.log('Generating registration revenue report');
  
  const sql = `
    SELECT e.EventID, e.EventName, e.RegistrationFee,
           COUNT(ep.ParticipantID) as ParticipantCount,
           COALESCE(e.RegistrationFee, 0) * COUNT(ep.ParticipantID) as Revenue
    FROM Event e
    LEFT JOIN EventParticipation ep ON e.EventID = ep.EventID
    GROUP BY e.EventID
    ORDER BY Revenue DESC
  `;
  
  db.query(sql, (err, events) => {
    if (err) {
      console.error('Error generating registration revenue report:', err);
      return res.status(500).json({ error: 'Database error generating revenue report' });
    }
    
    const eventsWithSafeValues = events.map(event => ({
      ...event,
      Revenue: Number(event.Revenue) || 0,
      ParticipantCount: Number(event.ParticipantCount) || 0,
      RegistrationFee: Number(event.RegistrationFee) || 0
    }));
    
    const totalRevenue = eventsWithSafeValues.reduce((sum, event) => sum + event.Revenue, 0);
    const participantCount = eventsWithSafeValues.reduce((sum, event) => sum + event.ParticipantCount, 0);
    const eventCount = eventsWithSafeValues.length;
    const averageFeePerParticipant = participantCount > 0 ? (totalRevenue / participantCount) : 0;
    
    res.json({
      events: eventsWithSafeValues,
      summary: {
        totalRevenue,
        participantCount,
        eventCount,
        averageFeePerParticipant
      }
    });
  });
});

 // to sponsorship funds received
app.get('/api/admin/reports/sponsorship-funds', (req, res) => {
  
  
  const sql = `
    SELECT s.SponsorID, u.FirstName, u.LastName, u.Email,
           COUNT(s.SponsorshipID) as SponsorshipCount,
           SUM(CASE 
               WHEN s.ContractDetails LIKE '%Rs %' 
               THEN CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(s.ContractDetails, 'Rs ', -1), ' ', 1) AS DECIMAL(10,2))
               ELSE 0 
               END) as TotalAmount,
           MAX(s.PurchaseDate) as LastSponsorshipDate
    FROM Sponsorship s
    JOIN _USER u ON s.SponsorID = u.UserID
    WHERE s.PaymentStatus = 'Completed'
    GROUP BY s.SponsorID
    ORDER BY TotalAmount DESC
  `;
  
  db.query(sql, (err, sponsors) => {
    if (err) {
      console.error('Error generating sponsorship report:', err);
      
      const mockSponsors = [
        { SponsorID: 1, FirstName: "PTCL", LastName: "", Email: "ptcl@example.com", SponsorshipCount: 2, TotalAmount: 100000, LastSponsorshipDate: "2023-05-15" },
        { SponsorID: 2, FirstName: "Pepsi", LastName: "", Email: "pepsi@example.com", SponsorshipCount: 1, TotalAmount: 50000, LastSponsorshipDate: "2023-04-20" },
        { SponsorID: 3, FirstName: "Nestle", LastName: "", Email: "nestle@example.com", SponsorshipCount: 3, TotalAmount: 75000, LastSponsorshipDate: "2023-06-01" }
      ];
      
      const totalAmount = mockSponsors.reduce((sum, sponsor) => sum + sponsor.TotalAmount, 0);
      
      return res.json({
        sponsors: mockSponsors,
        summary: {
          totalSponsors: mockSponsors.length,
          totalSponsorships: mockSponsors.reduce((sum, sponsor) => sum + sponsor.SponsorshipCount, 0),
          totalAmount,
          averageAmountPerSponsor: totalAmount / mockSponsors.length
        }
      });
    }
    
    // Calculate summary
    const totalAmount = sponsors.reduce((sum, sponsor) => sum + (sponsor.TotalAmount || 0), 0);
    const totalSponsorships = sponsors.reduce((sum, sponsor) => sum + sponsor.SponsorshipCount, 0);
    
    res.json({
      sponsors,
      summary: {
        totalSponsors: sponsors.length,
        totalSponsorships,
        totalAmount,
        averageAmountPerSponsor: sponsors.length > 0 ? totalAmount / sponsors.length : 0
      }
    });
  });
});

 // to venue utilization report
app.get('/api/admin/reports/venue-utilization', (req, res) => {
  console.log('Generating venue utilization report');
  
  const sql = `
    SELECT v.VenueID, v.VenueName, v.Location, v.Capacity,
           COUNT(ev.EventID) as EventCount,
           GROUP_CONCAT(DISTINCT e.EventName SEPARATOR ', ') as Events
    FROM Venue v
    LEFT JOIN EventVenue ev ON v.VenueID = ev.VenueID
    LEFT JOIN Event e ON ev.EventID = e.EventID
    GROUP BY v.VenueID
    ORDER BY EventCount DESC
  `;
  
  db.query(sql, (err, venues) => {
    if (err) {
      console.error('Error generating venue utilization report:', err);
      return res.status(500).json({ error: 'Database error generating venue report' });
    }
    
    const venueTimesSql = `
      SELECT v.VenueID, v.VenueName,
             SUM(TIMESTAMPDIFF(HOUR, ev.EventDateTime, 
                               DATE_ADD(ev.EventDateTime, INTERVAL 2 HOUR))) as TotalHoursBooked
      FROM Venue v
      LEFT JOIN EventVenue ev ON v.VenueID = ev.VenueID
      GROUP BY v.VenueID
    `;
    
    db.query(venueTimesSql, (timeErr, venueTimes) => {
      const venuesWithTimes = venues.map(venue => {
        const timeData = venueTimes?.find(v => v.VenueID === venue.VenueID);
        return {
          ...venue,
          TotalHoursBooked: timeData?.TotalHoursBooked || 0
        };
      });
      
      const totalEvents = venuesWithTimes.reduce((sum, venue) => sum + venue.EventCount, 0);
      const totalHoursBooked = venuesWithTimes.reduce((sum, venue) => sum + Number(venue.TotalHoursBooked || 0), 0);
      
      res.json({
        venues: venuesWithTimes,
        summary: {
          totalVenues: venuesWithTimes.length,
          totalEvents,
          totalHoursBooked,
          averageEventsPerVenue: venuesWithTimes.length > 0 ? totalEvents / venuesWithTimes.length : 0
        }
      });
    });
  });
});

app.get('/api/admin/reports/accommodation', (req, res) => {
  
  const sql = `
    SELECT a.BedNO as AccommodationID, a.RoomNumber as Type, 'Campus Hostel' as Location, 
           1 as AllocatedCount, 1 as Capacity,
           CONCAT(u.FirstName, ' ', u.LastName) as Participants
    FROM Accommodation a
    LEFT JOIN _USER u ON a.ParticipantID = u.UserID
    ORDER BY a.RoomNumber
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error generating accommodation report:', err);
      return res.status(500).json({ error: 'Database error generating accommodation report' });
    }
    
    const roomMap = new Map();
    
    results.forEach(row => {
      const roomKey = row.Type;
      
      if (!roomMap.has(roomKey)) {
        roomMap.set(roomKey, {
          AccommodationID: row.AccommodationID,
          Type: row.Type,
          Location: row.Location,
          Capacity: 0,
          AllocatedCount: 0,
          Participants: []
        });
      }
      
      const roomData = roomMap.get(roomKey);
      roomData.Capacity += row.Capacity;
      roomData.AllocatedCount += row.AllocatedCount;
      if (row.Participants) {
        roomData.Participants.push(row.Participants);
      }
    });
    
    const accommodations = Array.from(roomMap.values()).map(room => {
      return {
        ...room,
        Participants: room.Participants.join(', '),
        UtilizationRate: room.Capacity > 0 ? Math.round((room.AllocatedCount / room.Capacity) * 100) : 0,
        RemainingCapacity: Math.max(0, room.Capacity - room.AllocatedCount)
      };
    });
    
    const totalCapacity = accommodations.reduce((sum, acc) => sum + acc.Capacity, 0);
    const totalAllocated = accommodations.reduce((sum, acc) => sum + acc.AllocatedCount, 0);
    const overallUtilization = totalCapacity > 0 ? Math.round((totalAllocated / totalCapacity) * 100) : 0;
    
    const summary = {
      totalAccommodations: accommodations.length,
      totalCapacity,
      totalAllocated,
      overallUtilization,
      remainingCapacity: Math.max(0, totalCapacity - totalAllocated)
    };
    
    res.json({
      accommodations,
      summary
    });
  });
});

// to accommodation request  for participants
app.post('/api/participant/request-accommodation', (req, res) => {
  
   
  const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
  
  db.query(userSql, (err, users) => {
    if (err) {
      console.error('Error fetching current user:', err);
      return res.status(500).json({ error: 'Database error fetching current user' });
    }
    
    if (users.length === 0) {
      console.log('No logged in user found');
      return res.status(401).json({ error: 'No logged in user found' });
    }
    
    const participantId = users[0].id;
    
    const checkSql = "SELECT * FROM Accommodation WHERE ParticipantID = ?";
    
    db.query(checkSql, [participantId], (checkErr, existingAccommodation) => {
      if (checkErr) {
        console.error('Error checking existing accommodation:', checkErr);
        return res.status(500).json({ error: 'Database error checking existing accommodation' });
      }
      
      if (existingAccommodation.length > 0) {
        console.log(`Participant ${participantId} already has accommodation assigned`);
        return res.status(400).json({ 
          error: 'You already have accommodation assigned',
          accommodation: existingAccommodation[0]
        });
      }
      
      const findRoomSql = `
        SELECT MIN(r.RoomNumber) as RoomNumber
        FROM (
          SELECT DISTINCT RoomNumber 
          FROM Accommodation
          WHERE (SELECT COUNT(*) FROM Accommodation a2 WHERE a2.RoomNumber = Accommodation.RoomNumber) < 4
        ) r
      `;
      
      db.query(findRoomSql, (roomErr, roomResults) => {
        if (roomErr) {
          console.error('Error finding available room:', roomErr);
          return res.status(500).json({ error: 'Database error finding available room' });
        }
        
        let roomNumber;
        
        if (roomResults.length === 0 || !roomResults[0].RoomNumber) {
          roomNumber = `R${Math.floor(Math.random() * 100) + 1}`;
        } else {
          roomNumber = roomResults[0].RoomNumber;
        }
        
        const checkInDate = new Date();
        const checkOutDate = new Date();
        checkOutDate.setDate(checkOutDate.getDate() + 3); 
        
        const insertSql = `
          INSERT INTO Accommodation (RoomNumber, CheckInDate, CheckOutDate, ParticipantID)
          VALUES (?, ?, ?, ?)
        `;
        
        db.query(
          insertSql, 
          [roomNumber, checkInDate, checkOutDate, participantId], 
          (insertErr, result) => {
            if (insertErr) {
              console.error('Error allocating accommodation:', insertErr);
              return res.status(500).json({ error: 'Database error allocating accommodation' });
            }
            

            const getAccommodationSql = `
              SELECT 
                a.BedNO, a.RoomNumber, a.CheckInDate, a.CheckOutDate,
                'Campus Hostel' as Location
              FROM Accommodation a
              WHERE a.BedNO = ?
            `;
            
            db.query(getAccommodationSql, [result.insertId], (getErr, accommodationResults) => {
              if (getErr) {
                console.error('Error fetching new accommodation details:', getErr);
                return res.status(500).json({ error: 'Accommodation was allocated but there was an error fetching details' });
              }
              
              console.log(`Accommodation allocated for participant ${participantId}`);
              return res.status(201).json({
                message: 'Accommodation allocated successfully',
                accommodation: accommodationResults[0]
              });
            });
          }
        );
      });
    });
  });
});

 // to participant current accommodation
app.get('/api/participant/accommodation', (req, res) => {
  const userSql = "SELECT * FROM currentLogin ORDER BY id DESC LIMIT 1";
  
  db.query(userSql, (err, users) => {
    if (err) {
      console.error('Error fetching current user:', err);
      return res.status(500).json({ error: 'Database error fetching current user' });
    }
    
    if (users.length === 0) {
      console.log('No logged in user found');
      return res.status(401).json({ error: 'No logged in user found' });
    }
    
    const participantId = users[0].id;
    
    const sql = `
      SELECT 
        a.BedNO, a.RoomNumber, a.CheckInDate, a.CheckOutDate,
        'Campus Hostel' as Location,
        GROUP_CONCAT(CONCAT(u.FirstName, ' ', u.LastName) SEPARATOR ', ') as Roommates
      FROM Accommodation a
      LEFT JOIN Accommodation a2 ON a.RoomNumber = a2.RoomNumber AND a.BedNO != a2.BedNO
      LEFT JOIN _USER u ON a2.ParticipantID = u.UserID
      WHERE a.ParticipantID = ?
      GROUP BY a.BedNO, a.RoomNumber, a.CheckInDate, a.CheckOutDate
    `;
    
    db.query(sql, [participantId], (accErr, accommodations) => {
      if (accErr) {
        console.error('Error fetching accommodation:', accErr);
        return res.status(500).json({ error: 'Database error fetching accommodation' });
      }
      
      if (accommodations.length === 0) {
        return res.json({ hasAccommodation: false });
      }
      
      console.log(`Found accommodation for participant ${participantId}`);
      return res.json({
        hasAccommodation: true,
        accommodation: accommodations[0]
      });
    });
  });
});



 // to all judges
app.get('/api/judges', (req, res) => {
  console.log('Fetching all judges');
  
  const sql = `
    SELECT j.JudgeID, u.FirstName, u.LastName, j.Expertise
    FROM Judge j
    JOIN _USER u ON j.JudgeID = u.UserID
  `;
  
  db.query(sql, (err, judges) => {
    if (err) {
      console.error('Error fetching judges:', err);
      return res.status(500).json({ error: 'Database error fetching judges' });
    }
    
    console.log(`Found ${judges.length} judges`);
    res.json(judges);
  });
});

 // to judges for a specific event
app.get('/api/events/:eventId/judges', (req, res) => {
  const eventId = req.params.eventId;
  console.log(`Fetching judges for event ID: ${eventId}`);
  
  const sql = `
    SELECT j.JudgeID, u.FirstName, u.LastName, j.Expertise, 
           CONCAT(u.FirstName, ' ', u.LastName) as Name
    FROM JudgeEvent je
    JOIN Judge j ON je.JudgeID = j.JudgeID
    JOIN _USER u ON j.JudgeID = u.UserID
    WHERE je.EventID = ?
  `;
  
  db.query(sql, [eventId], (err, judges) => {
    if (err) {
      console.error('Error fetching event judges:', err);
      return res.status(500).json({ error: 'Database error fetching event judges' });
    }
    
    console.log(`Found ${judges.length} judges for event ID: ${eventId}`);
    res.json(judges);
  });
});

//  createevent  judge assignments
app.post('/createevent', (req, res) => {
  const { 
    eventName, category, organizerId, description, rules, 
    dateTime, venueId, maxParticipants, registrationFee, judgeIds 
  } = req.body;
  
  if (!eventName || !category || !dateTime || !venueId || !maxParticipants || 
      registrationFee === undefined || !organizerId) {
    return res.status(400).json({ error: 'Missing required event information' });
  }

  db.beginTransaction(err => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ error: 'Database transaction error' });
    }
    
    const eventSql = `
      INSERT INTO Event 
      (EventName, Category, Description, Rules, OrganizerID, RegistrationFee, MaxParticipants) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(eventSql, [eventName, category, description, rules, organizerId, registrationFee, maxParticipants], 
      (eventErr, eventResult) => {
        if (eventErr) {
          console.error('Error creating event:', eventErr);
          return db.rollback(() => {
            res.status(500).json({ error: 'Failed to create event' });
          });
        }
        
        const eventId = eventResult.insertId;
        
        const venueSql = `
          INSERT INTO EventVenue 
          (EventID, VenueID, EventDateTime) 
          VALUES (?, ?, ?)
        `;
        
        db.query(venueSql, [eventId, venueId, dateTime], (venueErr) => {
          if (venueErr) {
            console.error('Error associating venue:', venueErr);
            return db.rollback(() => {
              res.status(500).json({ error: 'Failed to associate venue with event' });
            });
          }
          
          if (judgeIds && judgeIds.length > 0) {
            const judgeValues = judgeIds.map(judgeId => [judgeId, eventId]);
            
            const judgesSql = `
              INSERT INTO JudgeEvent (JudgeID, EventID) VALUES ?
            `;
            
            db.query(judgesSql, [judgeValues], (judgesErr) => {
              if (judgesErr) {
                console.error('Error assigning judges:', judgesErr);
                return db.rollback(() => {
                  res.status(500).json({ error: 'Failed to assign judges to event' });
                });
              }
              
              db.commit(commitErr => {
                if (commitErr) {
                  console.error('Error committing transaction:', commitErr);
                  return db.rollback(() => {
                    res.status(500).json({ error: 'Failed to create event' });
                  });
                }
                
                console.log(`Event created successfully with ID: ${eventId}`);
                res.status(201).json({ 
                  message: 'Event created successfully',
                  eventId: eventId
                });
              });
            });
          } else {
            db.commit(commitErr => {
              if (commitErr) {
                console.error('Error committing transaction:', commitErr);
                return db.rollback(() => {
                  res.status(500).json({ error: 'Failed to create event' });
                });
              }
              
              console.log(`Event created successfully with ID: ${eventId}`);
              res.status(201).json({ 
                message: 'Event created successfully',
                eventId: eventId
              });
            });
          }
        });
      }
    );
  });
});

//  event editing  judge assignments
app.post('/api/events/:id', (req, res) => {
  const eventId = req.params.id;
  const { 
    eventName, category, description, rules, dateTime, venueId, 
    maxParticipants, registrationFee, organizerId, judgeIds 
  } = req.body;
  
  db.beginTransaction((transErr) => {
    if (transErr) {
      console.error('Error starting transaction:', transErr);
      return res.status(500).json({ error: 'Database transaction error' });
    }
    
    const eventSql = `
      UPDATE Event 
      SET EventName = ?, Category = ?, Description = ?, Rules = ?, 
          RegistrationFee = ?, MaxParticipants = ?, OrganizerID = ?
      WHERE EventID = ?
    `;
    
    db.query(
      eventSql, 
      [eventName, category, description, rules, registrationFee, maxParticipants, organizerId, eventId], 
      (eventErr, eventResult) => {
        if (eventErr) {
          console.error('Error updating event:', eventErr);
          return db.rollback(() => {
            res.status(500).json({ error: 'Database error updating event' });
          });
        }
        
        // Update EventVenue table
        const venueSql = `
          UPDATE EventVenue 
          SET VenueID = ?, EventDateTime = ?
          WHERE EventID = ?
        `;
        
        db.query(venueSql, [venueId, dateTime, eventId], (venueErr, venueResult) => {
          if (venueErr) {
            console.error('Error updating event venue:', venueErr);
            return db.rollback(() => {
              res.status(500).json({ error: 'Database error updating event venue' });
            });
          }
          
          // Update judge assignments - first remove all existing assignments
          const deleteJudgesSql = `DELETE FROM JudgeEvent WHERE EventID = ?`;
          
          db.query(deleteJudgesSql, [eventId], (deleteErr) => {
            if (deleteErr) {
              console.error('Error removing existing judge assignments:', deleteErr);
              return db.rollback(() => {
                res.status(500).json({ error: 'Database error updating judge assignments' });
              });
            }
            
            // Now add new judge assignments if any are selected
            if (judgeIds && judgeIds.length > 0) {
              // Create array of values for bulk insert
              const judgeValues = judgeIds.map(judgeId => [judgeId, eventId]);
              
              const judgesSql = `INSERT INTO JudgeEvent (JudgeID, EventID) VALUES ?`;
              
              db.query(judgesSql, [judgeValues], (judgesErr) => {
                if (judgesErr) {
                  console.error('Error assigning judges:', judgesErr);
                  return db.rollback(() => {
                    res.status(500).json({ error: 'Database error assigning judges' });
                  });
                }
                
                // Commit transaction
                db.commit(commitErr => {
                  if (commitErr) {
                    console.error('Error committing transaction:', commitErr);
                    return db.rollback(() => {
                      res.status(500).json({ error: 'Database transaction error' });
                    });
                  }
                  
                  res.status(200).json({ message: 'Event updated successfully' });
                });
              });
            } else {
              // No judges to assign, commit transaction
              db.commit(commitErr => {
                if (commitErr) {
                  console.error('Error committing transaction:', commitErr);
                  return db.rollback(() => {
                    res.status(500).json({ error: 'Database transaction error' });
                  });
                }
                
                res.status(200).json({ message: 'Event updated successfully' });
              });
            }
          });
        });
      }
    );
  });
});

app.get('/api/events/:eventId', (req, res) => {
  const eventId = req.params.eventId;
  console.log(`Fetching event with ID: ${eventId}`);
  
  const sql = `
    SELECT e.EventID, e.EventName, e.Category, e.Description, e.Rules, e.RegistrationFee, e.MaxParticipants, 
           e.OrganizerID, ev.EventDateTime as DateTime, v.VenueName, v.Location, v.Capacity, u.FirstName, u.LastName, u.Email,
           v.VenueID
    FROM Event e 
    LEFT JOIN EventVenue ev ON e.EventID = ev.EventID
    LEFT JOIN Venue v ON ev.VenueID = v.VenueID
    LEFT JOIN _USER u ON e.OrganizerID = u.UserID
    WHERE e.EventID = ?`;
  
  db.query(sql, [eventId], (err, results) => {
    if (err) {
      console.error('Error fetching event details:', err);
      return res.status(500).json({ error: 'Database error fetching event details' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = results[0];
    
    // Get registered participants count
    const countSql = `SELECT COUNT(*) as RegisteredParticipants FROM EventParticipation WHERE EventID = ?`;
    db.query(countSql, [eventId], (countErr, countResults) => {
      if (countErr) {
        console.error('Error fetching participant count:', countErr);
        event.RegisteredParticipants = 0;
        return res.json(event);
      }
      
      event.RegisteredParticipants = countResults[0].RegisteredParticipants || 0;
      return res.json(event);
    });
  });
});

app.get('/api/participan8t/:id', (req, res) => {
  const participantId = req.params.id;
  
  db.query('CALL GetParticipantDetails(?)', [participantId], (err, results) => {
      if (err) {
          console.error('Error fetching participant details:', err);
          return res.status(500).json({ error: 'Database error fetching participant details' });
      }
      
      if (!results || results.length === 0 || results[0].length === 0) {
          return res.status(404).json({ error: 'Participant not found' });
      }

      
      res.json(participantData);
  });
});