import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User.model";

export const authOptions = {
  providers: [
    // === Google Provider ===
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    
    // === Credentials Provider (Email/Password) ===
    CredentialsProvider({
      name: "credentials",
      credentials: {}, // We'll handle the form on our login page

      async authorize(credentials) {
        const { email, password } = credentials;

        try {
          await dbConnect();
          const user = await User.findOne({ email }).select("+password");

          if (!user) {
            throw new Error("Invalid credentials");
          }

          const isPasswordCorrect = await bcrypt.compare(password, user.password);

          if (!isPasswordCorrect) {
            throw new Error("Invalid credentials");
          }
          
          return user;

        } catch (err) {
          throw new Error(err);
        }
      },
    }),
  ],

  // Custom callbacks to handle session data
  callbacks: {
    // This callback is called whenever a user signs in or a session is checked.
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        try {
          await dbConnect();
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            await User.create({
                name: user.name,
                email: user.email,
                role: 'doctor' // Default role for Google sign-in
            });
          }
          return true; // Sign in successful
        } catch (error) {
          console.error("Error during Google sign-in check:", error);
          return false; // Prevent sign-in on error
        }
      }
      return true; // For credentials provider, let it pass
    },
    
    // UPDATED JWT CALLBACK
    async jwt({ token, user }) {
      // If user object exists (on initial sign-in), fetch full user data from DB
      if (user) {
        await dbConnect();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
        }
      }
      return token;
    },

    // This callback is called whenever a session is checked.
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

// ... rest of the code like session, secret, pages ...

  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login", // Redirect to our custom login page
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };