const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../middleware/auth.js');
const {
    createProject,
    updateProject,
    deleteProject,
    getTablesAndCards,
    submitProject,
    editProject,
} = require('../controllers/projects')

const mongoose = require('mongoose');


// Create new project
router.post('/', ensureAuthenticated, createProject);


// Update project details
router.patch("/:id", ensureAuthenticated, updateProject);


// Delete a project by its project ID.
router.delete("/:id", ensureAuthenticated, deleteProject);


/*****
 * Routes for serving project pages
 **/

// These routes serve the pages that list projects.
// We don't require authentication for this page. Anyone can view projects.
router.get(["/tables", "/cards"], getTablesAndCards);


// This route serves the new project form page.
router.get("/submit", submitProject);


// This route serves the page for editing a given project
// Updated edit route to handle projects
// Edit a project
router.get("/edit/:id", ensureAuthenticated, editProject);

module.exports = router;