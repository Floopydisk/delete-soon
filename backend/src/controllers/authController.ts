import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { exec } from "child_process";

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyUser = async (req: Request, res: Response) => {
  try {
    // User is already attached to req by authenticate middleware
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const seedUsers = (req: Request, res: Response) => {
  exec("pnpm run seed", { cwd: "./backend" }, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res
        .status(500)
        .json({ message: "Error seeding database", error: stderr });
    }
    res
      .status(200)
      .json({ message: "Database seeded successfully", output: stdout });
  });
};
