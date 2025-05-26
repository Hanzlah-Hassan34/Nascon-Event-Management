/**
 * Authentication middleware
 * Provides functions to check user authentication and role permissions
 */

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ message: 'Authentication required' });
};

// Check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin privileges required' });
};

// Check if user is an event organizer
const isOrganizer = (req, res, next) => {
  if (req.session && req.session.user && 
      (req.session.user.role === 'admin' || req.session.user.role === 'organizer')) {
    return next();
  }
  return res.status(403).json({ message: 'Organizer privileges required' });
};

// Check if user is the owner of an event (for organizers editing their own events)
const isEventOwner = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.session.user.role === 'admin') {
    // Admins can edit any event
    return next();
  }
  
  if (req.session.user.role === 'organizer') {
    const eventId = req.params.id || req.body.eventId;
    
    // Get the event from the database to check ownership
    const db = require('../config/database');
    db.query('SELECT * FROM Event WHERE EventID = ? AND OrganizerID = ?', 
      [eventId, req.session.user.id])
      .then(([results]) => {
        if (results.length > 0) {
          return next();
        } else {
          return res.status(403).json({ 
            message: 'You can only edit events you have created' 
          });
        }
      })
      .catch(err => {
        console.error('Error checking event ownership:', err);
        return res.status(500).json({ message: 'Server error' });
      });
  } else {
    return res.status(403).json({ message: 'Organizer privileges required' });
  }
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isOrganizer,
  isEventOwner
};
