const { Project } = require('../../models')

const deleteProject = async function (req, res) {
    try {
        const projectId = req.params.id;

        // Validate ObjectId first
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).send("Invalid project ID format.");
        }

        const project = await Project.findById(projectId);
            
        if (!project) {
            return res.status(404).send("Project not found.");
        }

        // Check if the user is the owner or an admin.
        if (project.owner._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).send("Forbidden: You are not authorized to delete this project.");
        }

        await Project.findByIdAndDelete(projectId);

        res.json({ message: "Project deleted successfully." });

    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).send("Internal Server Error.");
    }
}

module.exports = {
    deleteProject
}