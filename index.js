require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const { log } = require("console");
const session = require("express-session");
const passport = require("passport");
const MongoDBStore = require('connect-mongodb-session')(session);
const { Project, User } = require('./models');


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

// Initialize MongoDB Session Store
const sessionStore = new MongoDBStore({
  uri: process.env.MongoDBString,
  collection: 'mySessions',
});

sessionStore.on('error', (error) => {
  console.error('Session store error:', error);
});

// Configure Session Middleware
app.use(
  session({
    secret: process.env.AuthenticateString,
    resave: false,
    saveUninitialized: true,
    store: sessionStore, // Use MongoDB session store
  })
);

app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
// mongoose.connect('mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.0');
mongoose
  .connect(process.env.MongoDBString)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// User Authentication middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}


app.get("/", function (req, res) {
  res.render("register");
});


app.get("/login", function (req, res) {
  res.render("login");
});


app.get("/register", function (req, res) {
  res.render("register");
});


app.get("/submit", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});


// app.get(["/project_tables", "/project_cards"], function (req, res) {

//   if (req.isAuthenticated()) {
//     User.find({ "project": { $ne: null } })
//       .then(function (foundUsers) {
//         if (req.url === "/project_tables") {
//           // Render users in table format
//           res.render("project_tables", { usersWithProjects: foundUsers });
//         } else if (req.url === "/project_cards") {
//           // Render users in card format
//           res.render("project_cards", { usersWithProjects: foundUsers });
//         } else {
//           // Handle unexpected URL (optional)
//           res.status(404).send("Not Found");
//         }
//       })
//       .catch(function (err) {
//         console.error(err);
//         res.status(500).send("Internal Server Error");
//       });
//   } else {
//     res.redirect("/login");
//   }
// });
// Updated to use Project model instead of User model
app.get(["/project_tables", "/project_cards"], function (req, res) {
  if (req.isAuthenticated()) {
    Project.find()
      .populate('owner', 'username email')
      .populate('contributors', 'username email')
      .then(function (projects) {
        if (req.url === "/project_tables") {
          res.render("project_tables", { projects });
        } else if (req.url === "/project_cards") {
          res.render("project_cards", { projects });
        }
      })
      .catch(function (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      });
  } else {
    res.redirect("/login");
  }
});


app.get("/logout", function (req, res) {

  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      res.clearCookie('connect.sid'); // This clears the session cookie
      res.status(500).send('Failed to log out');
    } else {
      console.log('you have logged off');
      res.render('logout_confirmed');
    }
  });
});


// app.get("/edit/:id", ensureAuthenticated, function (req, res) {
//   // Check if the authenticated user is authorized qto update this record
//   if (req.user._id.toString() !== req.params.id) {
//     return res.status(403).send("Forbidden: You are not allowed to update this project.");
//   }
//   User.findById(req.params.id)
//     .then(foundUser => {
//       if (foundUser) {
//         res.render("edit", { user: foundUser });
//       } else {
//         res.status(404).send("User not found");
//       }
//     })
//     .catch(err => {
//       console.log(err);
//       res.status(500).send("Internal Server Error");
//     });
// });
// Updated edit route to handle projects
// Edit a project
app.put("/projects/:id", ensureAuthenticated, function (req, res) {
  Project.findById(req.params.id)
    .populate('owner')
    .populate('contributors')
    .then(project => {
      if (!project) {
        return res.status(404).send("Project not found");
      }
      // Check if user is owner or contributor
      if (project.owner._id.toString() !== req.user._id.toString() && 
          !project.contributors.some(c => c._id.toString() === req.user._id.toString())) {
        return res.status(403).send("Forbidden: You are not authorized to edit this project.");
      }
      res.render("edit", { project });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send("Internal Server Error");
    });
});


// NOTE This route deletes a user, not just a project!!!
// TODO Clarify what this route is supposed to do.
// TODO Use separate routes for deleting projects and user records.
// app.delete("/delete/:id", ensureAuthenticated, function (req, res) {
//   const userIdToDelete = req.params.id;
  
//   const loggedInUserId = req.user._id.toString();
//   const loggedInUserRole = req.user.role;

//   // Validate input before performing MongoDB operations
//   if (!mongoose.Types.ObjectId.isValid(userIdToDelete)) {
//     return res.status(400).send("Invalid user ID format.");
//   }

//   // Check authorization
//   if (loggedInUserId !== userIdToDelete && loggedInUserRole !== "admin") {
//     return res.status(403).send("Forbidden: You are not allowed to delete this user.");
//   }

//   // Perform the delete operations
//   User.findByIdAndDelete(userIdToDelete)
//     .then(deletedUser => {
//       if (!deletedUser) {
//         return res.status(404).send("User not found.");
//       }

//       // If the currently logged-in user is deleting their own account, log them out.
//       if (loggedInUserId === userIdToDelete) {
//         req.logout(err => {
//           if (err) {
//             console.error("Error logging out:", err);
//             return res.status(500).send("Error logging out after account deletion.");
//           }
//           req.session.destroy(err => {
//             if (err) {
//               console.error("Error destroying session:", err);
//               return res.status(500).send("Error destroying session after account deletion.");
//             }
//             res.clearCookie("connect.sid"); // Clear the session cookie
//             return res.send("Account deleted successfully and session terminated.");
//           });
//         });
//       } else {
//         // Admin deleting another user's account
//         res.json({ message: "User deleted successfully." });
//       }
//     })
//     .catch(err => {
//       console.error("Error deleting user:", err);
//       res.status(500).send("Internal Server Error.");
//     });
// });
// Updated delete route to handle projects instead of users
app.delete("/projects/:id", ensureAuthenticated, function (req, res) {
  const projectId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).send("Invalid project ID format.");
  }

  Project.findById(projectId)
    .then(project => {
      if (!project) {
        return res.status(404).send("Project not found.");
      }
      
      // Check if user is owner or admin
      if (project.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        return res.status(403).send("Forbidden: You are not authorized to delete this project.");
      }

      return Project.findByIdAndDelete(projectId);
    })
    .then(() => {
      res.json({ message: "Project deleted successfully." });
    })
    .catch(err => {
      console.error("Error deleting project:", err);
      res.status(500).send("Internal Server Error.");
    });
});


app.post("/register", function (req, res) {
  User.register({ username: req.body.username }, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/project_cards");
      });
    }
  });
});


app.post("/login", function (req, res) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      console.log(err);
      return res.redirect("/login"); // Redirect back to login if there's an error
    }
    if (!user) {
      return res.redirect("/login"); // Redirect if no user is found
    }
    req.login(user, function (err) {
      if (err) {
        console.log(err);
        return res.redirect("/login"); // Redirect if login fails
      }
      return res.redirect("/project_tables"); // Successful login
    });
  })(req, res);
});


app.post('/logout', (req, res) => {
  req.session.destroy();
  res.render('logout_confirmed');
});


// Updated submit route to create new project
app.post('/submit', authenticateToken, async (req, res) => {
  try {
      // First, check if the user exists in MongoDB
      const user = await User.findOne({ email: req.user.email });
      
      if (!user) {
          return res.status(404).json({ 
              error: 'User not found in database. Please complete your profile first.' 
          });
      }

      // If user exists, proceed with project creation
      const project = new Project({
          title: req.body.title,
          description: req.body.description,
          percentDone: req.body.percent_done,
          // TODO Add Tags
          owner: user._id,  // Use the MongoDB user._id instead of req.user.id
          contributors: [req.user._id] // Owner is automatically a contributor
      });

      await project.save();
      res.status(201).json({ message: 'Project created successfully', project });

  } catch (error) {
      console.error('Error in /submit route:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


// Updated update route to handle project updates
app.post("/update/:id", ensureAuthenticated, function (req, res) {
  const projectId = req.params.id;
  
  Project.findById(projectId)
    .then(project => {
      if (!project) {
        return res.status(404).send("Project not found");
      }

      // Check if user is owner or contributor
      // Reject the user if they are not owner and not one of the contributors.
      if (project.owner.toString() !== req.user._id.toString() && 
          !project.contributors.some(c => c.toString() === req.user._id.toString())) {
        return res.status(403).send("Forbidden: You are not authorized to update this project.");
      }

      // Update project fields
      project.title = req.body.project;
      project.description = req.body.description;
      project.percentDone = req.body.percent_done;
      project.updatedAt = Date.now();

      return project.save();
    })
    .then(() => {
      res.redirect("/project_tables");
    })
    .catch(err => {
      console.error("Error updating project:", err);
      res.status(500).send("An unexpected error occurred.");
    });
});


// Code needed for Railway deploy  
// const port = process.env.PORT || 3000;
// // Listen on `port` and 0.0.0.0
// app.listen(port, "0.0.0.0", function () {
//   // ...
// });


const port = process.env.PORT || 3000

app.listen(port, function () {
  console.log(`Server on ${port}...`);
});



