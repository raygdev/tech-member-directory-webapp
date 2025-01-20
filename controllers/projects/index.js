const { createProject } = require('./create-project')
const { updateProject } = require('./update-project')
const { deleteProject } = require('./delete-project')
const { getTablesAndCards } = require('./get-tables-and-cards')
const { submitProject } = require('./submit-project')
const { editProject } = require('./edit-project')

module.exports = {
    createProject,
    updateProject,
    deleteProject,
    getTablesAndCards,
    submitProject,
    editProject
}