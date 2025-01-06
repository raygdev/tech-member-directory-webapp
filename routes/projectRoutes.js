const express = require('express');
const router = express.Router();
const { Project, User } = require('../models/index.js');
const ensureAuthenticated = require('../middleware/auth.js');

// app.post("/submit", ensureAuthenticated, function (req, res) {
//   User.findById(req.user._id)
//     .then(foundUser => {
//       if (foundUser) {
//         foundUser.project = req.body.project;
//         foundUser.email = req.body.email;
//         foundUser.percent_done = req.body.percent_done;
//         foundUser.description = req.body.description;
//         return foundUser.save();
//       }
//       return null;
//     })
//     .then(() => {
//       res.redirect("/project_tables");
//     })
//     .catch(err => {
//       console.log(err);
//       res.status(500).send("An error occurred while sumitting your project.");
//     });
// });
// Updated submit route to create new project
router.post('/', ensureAuthenticated, async (req, res) => {
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
            percentDone: Number(req.body.percent_done),
            // TODO Add Tags
            ownerId: user._id,  // Use the MongoDB user._id instead of req.user.id
            ownerDisplayName: user.DisplayName,
            contributors: [req.user._id], // Owner is automatically a contributor
            createdAt: Date.now(),
            updatedAt: Date.now()
        });

        await project.save();
        res.status(201).json({ message: 'Project created successfully', project });

    } catch (error) {
        console.error('Error in /submit route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Updated update route to handle project updates
// router.post("/update/:id", ensureAuthenticated, function (req, res) {
router.put("/:id", ensureAuthenticated, function (req, res) {
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
router.delete("/:id", ensureAuthenticated, function (req, res) {
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
// We don't require authentication for this page. Anyone can view projects.
router.get(["/project_tables", "/project_cards"], function (req, res) {
    console.log("/roject_cards or project_tables", req.url);
    if (req.isAuthenticated()) {
        console.log("Authenticated");
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
// Serves the page for editing a given project
// Updated edit route to handle projects
// Edit a project
router.get("/edit/:id", ensureAuthenticated, function (req, res) {
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


module.exports = router;