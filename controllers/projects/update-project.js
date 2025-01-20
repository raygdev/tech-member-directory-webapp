const { Project } = require('../../models')

const updateProject = async function (req, res) {
    try {
        const projectId = req.params.id;

        // Validate ObjectId first
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ error: "Invalid project ID format" });
        }

        const project = await Project.findById(projectId);
        
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        // Check if user is owner or contributor
        if (project.owner._id.toString() !== req.user._id.toString() &&
            !project.contributors.some(c => c.toString() === req.user._id.toString())) {
            return res.status(403).json({ error: "Forbidden: You are not authorized to update this project" });
        }

        // Update project fields
        project.title = req.body.title;
        project.description = req.body.description;
        project.percentDone = req.body.percentDone;
        project.updatedAt = Date.now();

        await project.save();
        
        // Return JSON response instead of redirect
        return res.json({ 
            message: "Project updated successfully",
            project: project
        });

    } catch (error) {
        console.error("Error updating project:", error);
        return res.status(500).json({ error: "An unexpected error occurred" });
    }
}

module.exports = {
    updateProject
}