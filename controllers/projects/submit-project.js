const submitProject = function (req, res) {
    if (req.isAuthenticated()) {
        res.render("submit", { user: req.user });
    } else {
        res.redirect("/login");
    }
}

module.exports = {
    submitProject
}