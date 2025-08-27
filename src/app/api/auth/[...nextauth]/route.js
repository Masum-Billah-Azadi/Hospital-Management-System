//src\app\api\auth\[...nextauth]\route.js
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
      credentials: {},

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

  // --- সম্পূর্ণ নতুন এবং সঠিক Callbacks ---
callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        try {
          await dbConnect();
          const existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            await User.create({
                name: user.name,
                email: user.email,
                image: user.image,
                role: 'doctor'
            });
          }
          return true;
        } catch (error) {
          console.error("Error in Google signIn callback:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // প্রাথমিক সাইন-ইনের সময়
      if (user) {
        await dbConnect();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          token.name = dbUser.name;
          token.image = dbUser.image;
        }
      }

      // যখন ক্লায়েন্ট থেকে update() ফাংশন কল করা হয়
      if (trigger === "update" && session) {
        token.name = session.name;
        token.image = session.image;
      }
      
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.image = token.image;
      }
      return session;
    },
  },
  // --- Callbacks শেষ ---

  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };