const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

exports.register = async (req, res) => {
  const { email, password, firstName, lastName, userId } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      userId,
    });

    const token = generateToken(user);

    res.status(201).json({ token });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.json({ token: generateToken(user) }); // 👈 FIXED
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};
