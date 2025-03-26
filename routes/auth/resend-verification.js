const { Verification } = require("../../models");
const transporter = require("../../config/nodemailer.config");

const postResendVerification = async (req, res) => {
  const { userid } = req.query;
  const code = Math.floor(100000 + Math.random() * 900000);
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
      from: process.env.EMAIL,
      to: verificationToSend.user.email,
      subject: "Your Casual Coding verification code",
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
