import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/lib/models/user";

// Handle POST request for user registration
export async function POST(request) {
  try {
    // Parse the request body to extract user details
    const { name, email, password } = await request.json();

    // Validate the input fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Establish a connection to the database
    await connectDB();

    // Check if a user with the given email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Respond with a success message and the created user's details
    return NextResponse.json(
      { 
        message: "User created successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    // Log any errors that occur during the registration process
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Error creating user" },
      { status: 500 }
    );
  }
}