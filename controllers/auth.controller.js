import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js";
import { z } from "zod";

export const signupController = async (req, res) => {
  // zod schema
  const schema = z.object({
    email: z.string()
      .min(3, "Email must be at least 3 characters long")
      .max(100, "Email must be less than or equal to 100 characters")
      .email("Invalid email address"),
    
    password: z.string()
      .min(6, "Password must be at least 6 characters long")
      .max(100, "Password must be less than or equal to 100 characters")
      .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
      .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
      .regex(/(?=.*\d)/, "Password must contain at least one number")
      .regex(/(?=.*[@$!%*?&])/, "Password must contain at least one special character"),
    
    name: z.string()
      .min(3, "Name must be at least 3 characters long")
      .max(100, "Name must be less than or equal to 100 characters")
  });

  const parsedDataWithSuccess = schema.safeParse(req.body);
  console.log(parsedDataWithSuccess)

  if (!parsedDataWithSuccess.success) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Incorrect Input...",
        errors: parsedDataWithSuccess.error.errors.map((err) => err.message),
      });
  }

  const { email, password, name } = parsedDataWithSuccess.data

  try {
    const userAlreadyExists = await User.findOne({ email });

    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User Already Exists !!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken: verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await user.save();

    // jwt token
    generateTokenAndSetCookie(res, user._id);

    // send verification mail
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token...",
      });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);
    return res.status(200).json({
      success: true,
      message: "Email verified Successfully!!",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out Successfully!!" });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res
        .status(404)
        .json({ success: false, message: "User does not exists..." });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ success: false, message: "Invalid Credentials" });
    }

    generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged In Successfully !!",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("Error in logging: ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
