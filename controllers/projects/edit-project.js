const { Project } = require('../../models')

const editProject = function (req, res) {
    Project.findById(req.params.id)
        .populate('owner')
        .populate('contributors')
        .then(project => {
            if (!project) {
                return res.status(404).send("Project not found");
            }
            // Check if the user is the owner or a contributor
            if (project.owner._id.toString() !== req.user._id.toString() &&
                !project.contributors.some(c => c._id.toString() === req.user._id.toString())) {
                return res.status(403).send("Forbidden: You are not authorized to edit this project.");
            }
            res.render("edit", { project, user: req.user });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
}

module.exports = {
    editProject
}