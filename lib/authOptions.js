import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import connectDb from "@/db/connectDb";
import User from "@/models/User";

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        if (!email || !password) {
          throw new Error("Please provide both email and password");
        }

        await connectDb();

        const user = await User.findOne({ email });

        if (!user) {
          throw new Error("No user found with this email");
        }

        if (!user.isVerified) {
          throw new Error("Please verify your email before logging in");
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          throw new Error("Incorrect password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },

    async signIn({ user }) {
      await connectDb();

      let dbUser = await User.findOne({ email: user.email });

      if (!dbUser) {
        const username = user.name
          ? user.name.replace(/\s+/g, "").toLowerCase()
          : user.email.split("@")[0];

        dbUser = await User.create({
          email: user.email,
          username,
          role: "user",
          isVerified: true,
        });
      }

      user.id = dbUser._id.toString();
      user.role = dbUser.role;
      user.isBlocked = dbUser.isBlocked;

      if (dbUser.isBlocked) {
        throw new Error("Your account is blocked by admin");
      }

      return true;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
