import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/lib/models/user";

// Ensure necessary environment variables are set
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Please provide NEXTAUTH_SECRET environment variable");
}

if (!process.env.NEXTAUTH_URL) {
  throw new Error("Please provide NEXTAUTH_URL environment variable");
}

// Configuration options for NextAuth
export const authOptions = {
  // Define authentication providers
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      // Custom authorization logic
      async authorize(credentials) {
        try {
          // Connect to the database
          await connectDB();
          
          // Validate credentials
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Please provide email and password");
          }

          // Find user by email
          const user = await User.findOne({ 
            email: credentials.email 
          }).select("+password");

          // Check if user exists
          if (!user) {
            throw new Error("No user found with this email");
          }

          // Validate password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          // Return user object if authentication is successful
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],
  // Define custom pages for authentication
  pages: {
    signIn: "/sign-in",
    signUp: "/sign-up",
    error: "/auth/error",
  },
  // Session configuration
  session: {
    strategy: "jwt", // Use JSON Web Tokens for session management
    maxAge: 6 * 60 * 60, // Session duration: 6 hours
  },
  // Callbacks for handling JWT and session
  callbacks: {
    // JWT callback to include user information in the token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    // Session callback to include token information in the session
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Secret for signing tokens
  debug: process.env.NODE_ENV === "development", // Enable debug mode in development
};

// Create NextAuth handler with the defined options
const handler = NextAuth(authOptions);

// Export the handler for GET and POST requests
export { handler as GET, handler as POST };