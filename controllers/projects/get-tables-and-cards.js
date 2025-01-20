const { Project } = require('../../models')

const getTablesAndCards = function (req, res) {
    console.log("Authenticated");
    Project.find()
        .populate('owner', 'username email')
        .populate('contributors', 'username email')
        .then(function (projects) {
            console.log("projects", projects);
            if (req.url === "/tables") {
                res.render("tables", { projects, user: req.user });
            } else if (req.url === "/cards") {
                res.render("cards", { projects, user: req.user });
            }
        })
        .catch(function (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
        });
}

module.exports = {
    getTablesAndCards
}