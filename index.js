require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const { log } = require("console");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const MongoDBStore = require('connect-mongodb-session')(session);

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

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  project: String,
  percent_done: String,
  description: String,
  passwordResetToken: String
});

userSchema.plugin(passportLocalMongoose); // Adds username/password hashing and authentication

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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


app.get(["/project_tables", "/project_cards"], function (req, res) {

  if (req.isAuthenticated()) {
    User.find({ "project": { $ne: null } })
      .then(function (foundUsers) {
        if (req.url === "/project_tables") {
          // Render users in table format
          res.render("project_tables", { usersWithProjects: foundUsers });
        } else if (req.url === "/project_cards") {
          // Render users in card format
          res.render("project_cards", { usersWithProjects: foundUsers });
        } else {
          // Handle unexpected URL (optional)
          res.status(404).send("Not Found");
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


app.get("/edit/:id", function (req, res) {
  User.findById(req.params.id)
    .then(foundUser => {
      if (foundUser) {
        res.render("edit", { user: foundUser });
      } else {
        res.status(404).send("User not found");
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send("Internal Server Error");
    });
});


app.get("/delete/:id", function (req, res) {
  const userId = req.params.id;

  // Validate user ID (optional)
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send("Invalid user ID format");
  }

  User.findByIdAndDelete(userId)
    .then(deletedUser => {
      if (!deletedUser) {
        return res.status(404).send("User not found");
      }
      res.send("Project deleted successfully");
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Internal Server Error");
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


app.post("/submit", function (req, res) {
  console.log(req.user);
  User.findById(req.user)
    .then(foundUser => {
      if (foundUser) {
        foundUser.project = req.body.project;
        foundUser.email = req.body.email;
        foundUser.percent_done = req.body.percent_done;
        foundUser.description = req.body.description;
        return foundUser.save();
      }
      return null;
    })
    .then(() => {
      res.redirect("/project_tables");
    })
    .catch(err => {
      console.log(err);
    });
});


app.post("/update/:id", function (req, res) {
  User.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(updatedUser => {
      if (updatedUser) {
        res.redirect("/project_tables");
      } else {
        res.status(404).send("User not found");
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send("Internal Server Error");
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



