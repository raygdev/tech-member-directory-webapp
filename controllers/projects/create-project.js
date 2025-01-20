const  { User, Project }   = require('../../models')

const createProject = async (req, res) => {
    try {
        // First, check if the user exists in MongoDB
        const user = await User.findOne({ username: req.user.username });
        if (!user) {
            return res.status(404).json({
                error: 'User not found in database. Please complete your profile first.'
            });
        }

        console.log("\n", req.body);
        // If user exists, proceed with project creation
        const project = new Project({
            title: req.body.title,
            description: req.body.description,
            percentDone: Number(req.body.percent_done),
            // TODO Add Tags
            owner: {
                _id: user._id,
                username: user.username
            },
            contributors: [{
                _id: user._id,
                username: user.username
            }], // Owner is automatically a contributor
            createdAt: Date.now(),
            updatedAt: Date.now()
        });

        await project.save();
        res.status(201).json({ message: 'Project created successfully', project });

    } catch (error) {
        console.error('Error in /submit route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    createProject
}