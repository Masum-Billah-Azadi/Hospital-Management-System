//src\app\api\auth\[...nextauth]\route.js
import dbConnect from "@/lib/dbConnect";
import PatientProfile from "@/models/PatientProfile.model"; // **নতুন:** PatientProfile মডেল ইম্পোর্ট করা হয়েছে
import User from "@/models/User.model";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

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

  // --- Callbacks ---
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        try {
          await dbConnect();
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            // **পরিবর্তন:** নতুন ব্যবহারকারী তৈরি এবং তাদের জন্য প্রোফাইল তৈরি
            const newUser = await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              role: 'patient' // **গুরুত্বপূর্ণ:** নতুন ব্যবহারকারীর ডিফল্ট রোল 'patient' সেট করা হয়েছে
            });

            // **নতুন:** স্বয়ংক্রিয়ভাবে PatientProfile তৈরি
            // এই কোডটি নিশ্চিত করে যে নতুন রোগীর জন্য একটি প্রোফাইল থাকবে
            await PatientProfile.create({ 
              user: newUser._id,
              // আপনি চাইলে এখানে ডিফল্ট doctors অ্যারে যোগ করতে পারেন
            });

            console.log(`New user and patient profile created for ${user.email}`);
          }
          return true; // সাইন-ইন সফল
        } catch (error) {
          console.error("Error in Google signIn callback:", error);
          return false; // সাইন-ইন ব্যর্থ
        }
      }
      return true; // Credentials provider-এর জন্য
    },

    async jwt({ token, user, trigger, session }) {
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

      if (trigger === "update" && session) {
        token.name = session.name;
        token.image = session.image;
      }
      
      return token;
    },

    async session({ session, token }) {
        if (token && token.id) {
            // ডাটাবেস থেকে ব্যবহারকারীর সর্বশেষ তথ্য আনা হচ্ছে
            await dbConnect();
            const dbUser = await User.findById(token.id).select('-password');
            
            if (dbUser) {
                // সেশনে সর্বশেষ তথ্য যোগ করা হচ্ছে
                session.user.id = dbUser._id.toString();
                session.user.role = dbUser.role; // <-- ডাটাবেস থেকে আসা নতুন role
                session.user.name = dbUser.name;
                session.user.image = dbUser.image;
            }
        }
        return session;
    },
  },

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

