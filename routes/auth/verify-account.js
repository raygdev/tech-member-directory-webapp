const { Verification } = require("../../models");

const getVerifyAccount = async (req, res) => {
  res.render("auth/verify");
};

const postVerifyAccount = async (req, res) => {
  const { userid } = req.query;
  const { code } = req.body;
  try {
    // find the verification code by the userId
    const verification = await Verification.findOne({ user: userid });

    if (!verification) {
      res.render("auth/verify", {
        error: "Your code appears to be expired",
        code,
      });

      return;
    }

    if (parseInt(code) !== verification.code) {
      res.render("auth/verify", {
        error: "Your code doesn't match",
      });

      return;
    }
    //TODO: Implement after asking about **when** to authenticate
    // if the code matches
    // authenticate the user and redirect to /projects/tables ?
    await Verification.findOneAndDelete({ _id: verification._id })
    res.redirect('login')

  } catch (error) {
    console.log(error);
    res.render("auth/verify", {
      error: "Something went wrong",
    });
  }
};

module.exports = {
  getVerifyAccount,
  postVerifyAccount,
};
