const Verify = require("../../models/Verify");

const getVerifyAccount = async (req, res) => {
  res.render("auth/verify");
};

const postVerifyAccount = async (req, res) => {
  const { userId } = req.query;
  const { code } = req.body;
  try {
    // find the verification code by the userId
    const verification = await Verify.findOne({ user: userId });

    if (!verification) {
      res.render("auth/verify", {
        error: "Your code appears to be expired",
        code,
      });

      return;
    }

    if (code !== verification.code) {
      res.render("auth/verify", {
        error: "Your code doesn't match",
      });

      return;
    }
    //TODO: Implement after asking about **when** to authenticate
    // if the code matches
    // authenticate the user and redirect to /projects/tables ?
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
