const { Verification } = require("../../models");
const transporter = require("../../config/nodemailer.config");

const postResendVerification = async (req, res) => {
  const { userid } = req.query;
  const code = Math.floor(100000 + Math.random() * 999999);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  try {
    await Verification.deleteMany({ user: userid });

    const verificationToSend = new Verification({
      user: userid,
      code,
      expiresAt,
    });

    await verificationToSend.populate("user");
    await verificationToSend.save();

    await transporter({
      from: "evan76@ethereal.mail",
      to: verificationToSend.user.email,
      subject: "Your verification code",
      text: `Your code: ${verificationToSend.code}`,
    });
    res.json({
      message: "A new verification code was sent. Please check your inbox",
    });
  } catch (error) {
    console.log("[RESEND VERIFICATION ERROR]", error);
    res.status(400).json({ message: `An error occurred: ${error.message}` });
  }
};

module.exports = {
  postResendVerification,
};
